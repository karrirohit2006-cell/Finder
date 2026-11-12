import uuid
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional

from backend.app.db.session import get_db
from backend.app.models.models import FoundReport, LostReport, ItemImage, ImageEmbedding, User
from backend.app.schemas.schemas import (
    FoundReportCreate,
    FoundReportUpdate,
    FoundReportResponse,
    ItemImageResponse
)
from backend.app.api.deps import get_current_user, get_optional_current_user
from backend.app.services.vision_service import cosine_similarity, compute_multi_factor_match
from backend.app.services.notification_service import send_notification

router = APIRouter(prefix="/found-reports", tags=["Found Reports"])

def generate_report_id() -> str:
    now = datetime.datetime.now()
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"FOUND-{now.year}-{unique_suffix}"

def to_response(report: FoundReport, current_user: Optional[User] = None) -> dict:
    is_owner = bool(current_user and current_user.id == report.user_id)
    return {
        "id": report.id,
        "report_id": report.report_id,
        "item_name": report.item_name,
        "category": report.category,
        "description": report.description,
        "found_date": report.found_date,
        "approx_time": report.approx_time,
        "location": report.location,
        "colour": report.colour,
        "brand": report.brand,
        "additional_observations": report.additional_observations,
        "status": report.status,
        "created_at": report.created_at,
        "is_owner": is_owner,
        "reporter_name": report.user.full_name if report.user else "Anonymous",
        "reporter_type": report.user.account_type if report.user else "Student",
        "images": [
            {
                "id": img.id,
                "file_path": img.file_path,
                "filename": img.filename,
                "file_size": img.file_size,
                "is_primary": img.is_primary
            }
            for img in report.images
        ]
    }

@router.get("", response_model=List[FoundReportResponse])
def get_found_reports(
    q: Optional[str] = Query(None, description="Search keyword in item name, description, brand"),
    category: Optional[str] = Query(None, description="Filter by category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    status_filter: Optional[str] = Query("all", description="Filter by status (active, recovery_pending, returned, withdrawn, or all)"),
    sort_by: Optional[str] = Query("newest", description="Sort order (newest, oldest)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(FoundReport)
    
    if status_filter and status_filter != "all":
        query = query.filter(FoundReport.status == status_filter)
    else:
        # Default public view excludes withdrawn reports
        query = query.filter(FoundReport.status != "withdrawn")

    if category:
        query = query.filter(FoundReport.category == category)
    
    if location:
        query = query.filter(FoundReport.location.ilike(f"%{location}%"))
        
    if q:
        search_filter = or_(
            FoundReport.item_name.ilike(f"%{q}%"),
            FoundReport.description.ilike(f"%{q}%"),
            FoundReport.colour.ilike(f"%{q}%"),
            FoundReport.brand.ilike(f"%{q}%"),
            FoundReport.report_id.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
        
    if sort_by == "oldest":
        query = query.order_by(FoundReport.created_at.asc())
    else:
        query = query.order_by(desc(FoundReport.created_at))
        
    reports = query.offset(skip).limit(limit).all()
    return [to_response(r, current_user) for r in reports]

@router.post("", response_model=FoundReportResponse, status_code=status.HTTP_201_CREATED)
def create_found_report(
    data: FoundReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Photograph is an essential requirement for found items
    if not data.image_paths or len(data.image_paths) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photograph upload is required for reporting found items to facilitate verification."
        )

    report_id = generate_report_id()
    new_report = FoundReport(
        report_id=report_id,
        user_id=current_user.id,
        item_name=data.item_name.strip(),
        category=data.category.strip(),
        description=data.description.strip(),
        found_date=data.found_date,
        approx_time=data.approx_time.strip(),
        location=data.location.strip(),
        colour=data.colour.strip(),
        brand=data.brand.strip() if data.brand else None,
        additional_observations=data.additional_observations.strip() if data.additional_observations else None,
        status="active"
    )
    db.add(new_report)
    db.flush()

    # Link images and embeddings
    primary_embedding = None
    for idx, path in enumerate(data.image_paths):
        filename = path.split("/")[-1]
        img = ItemImage(
            found_report_id=new_report.id,
            file_path=path,
            filename=filename,
            file_size=1024,
            mime_type="image/jpeg",
            is_primary=(idx == 0)
        )
        db.add(img)
        db.flush()

        if data.embeddings and idx < len(data.embeddings) and data.embeddings[idx]:
            emb_vec = data.embeddings[idx]
            if idx == 0:
                primary_embedding = emb_vec
            emb = ImageEmbedding(
                item_image_id=img.id,
                found_report_id=new_report.id,
                embedding_json=json.dumps(emb_vec),
                vector_dim=len(emb_vec)
            )
            db.add(emb)

    db.commit()
    db.refresh(new_report)

    # Trigger automatic possible-match processing with active lost reports
    trigger_possible_match_notifications(new_report, primary_embedding, db)

    return to_response(new_report, current_user)

def trigger_possible_match_notifications(found: FoundReport, primary_emb: Optional[List[float]], db: Session):
    """Checks active lost reports and sends real notifications if high probability match detected."""
    try:
        active_lost = db.query(LostReport).filter(LostReport.status == "active").all()
        for lost in active_lost:
            # Don't notify self
            if lost.user_id == found.user_id:
                continue

            # Compare metadata
            visual_sim = 0.5
            if primary_emb and lost.images:
                # Find lost image embedding if any
                for limg in lost.images:
                    if limg.embedding:
                        lvec = json.loads(limg.embedding.embedding_json)
                        visual_sim = max(visual_sim, cosine_similarity(primary_emb, lvec))

            match_res = compute_multi_factor_match(
                visual_sim=visual_sim,
                query_category=found.category,
                target_category=lost.category,
                query_color=found.colour,
                target_color=lost.colour,
                query_location=found.location,
                target_location=lost.location,
                query_date=found.found_date,
                target_date=lost.lost_date
            )

            # If strong match (>= 60%), notify lost item reporter!
            if match_res["similarity_score"] >= 60.0:
                send_notification(
                    db=db,
                    user_id=lost.user_id,
                    title="Potential Match Found!",
                    message=f"A found item '{found.item_name}' at {found.location} matches your lost report '{lost.item_name}' ({match_res['similarity_score']}% match).",
                    type="possible_match",
                    link=f"/found-items/{found.report_id}"
                )
    except Exception as e:
        print(f"Match notification background check warning: {e}")

@router.get("/{id_or_code}", response_model=FoundReportResponse)
def get_found_report_detail(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if id_or_code.isdigit():
        report = db.query(FoundReport).filter(FoundReport.id == int(id_or_code)).first()
    else:
        report = db.query(FoundReport).filter(FoundReport.report_id == id_or_code.strip().upper()).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Found item report not found."
        )
    return to_response(report, current_user)

@router.put("/{id}", response_model=FoundReportResponse)
def update_found_report(
    id: int,
    data: FoundReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(FoundReport).filter(FoundReport.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this report."
        )
    
    if report.status in ["returned", "withdrawn"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit report with status '{report.status}'."
        )

    for field, val in data.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(report, field, val)

    db.commit()
    db.refresh(report)
    return to_response(report, current_user)

@router.post("/{id}/withdraw", response_model=FoundReportResponse)
def withdraw_found_report(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(FoundReport).filter(FoundReport.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to withdraw this report."
        )

    report.status = "withdrawn"
    db.commit()
    db.refresh(report)
    return to_response(report, current_user)
