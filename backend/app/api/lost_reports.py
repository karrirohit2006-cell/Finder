import uuid
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional

from backend.app.db.session import get_db
from backend.app.models.models import LostReport, ItemImage, ImageEmbedding, User
from backend.app.schemas.schemas import (
    LostReportCreate,
    LostReportUpdate,
    LostReportResponse,
    ItemImageResponse
)
from backend.app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/lost-reports", tags=["Lost Reports"])

def generate_report_id() -> str:
    now = datetime.datetime.now()
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"LOST-{now.year}-{unique_suffix}"

def to_response(report: LostReport, current_user: Optional[User] = None) -> dict:
    is_owner = bool(current_user and current_user.id == report.user_id)
    return {
        "id": report.id,
        "report_id": report.report_id,
        "item_name": report.item_name,
        "category": report.category,
        "description": report.description,
        "lost_date": report.lost_date,
        "approx_time": report.approx_time,
        "location": report.location,
        "colour": report.colour,
        "brand": report.brand,
        "additional_details": report.additional_details,
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

@router.get("", response_model=List[LostReportResponse])
def get_lost_reports(
    q: Optional[str] = Query(None, description="Search keyword in item name, description, brand"),
    category: Optional[str] = Query(None, description="Filter by category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    status_filter: Optional[str] = Query("all", description="Filter by status (active, match_found, recovery_pending, resolved, withdrawn, or all)"),
    sort_by: Optional[str] = Query("newest", description="Sort order (newest, oldest)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(LostReport)
    
    if status_filter and status_filter != "all":
        query = query.filter(LostReport.status == status_filter)
    else:
        # Default public view excludes withdrawn reports unless explicitly requested
        query = query.filter(LostReport.status != "withdrawn")

    if category:
        query = query.filter(LostReport.category == category)
    
    if location:
        query = query.filter(LostReport.location.ilike(f"%{location}%"))
        
    if q:
        search_filter = or_(
            LostReport.item_name.ilike(f"%{q}%"),
            LostReport.description.ilike(f"%{q}%"),
            LostReport.colour.ilike(f"%{q}%"),
            LostReport.brand.ilike(f"%{q}%"),
            LostReport.report_id.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
        
    if sort_by == "oldest":
        query = query.order_by(LostReport.created_at.asc())
    else:
        query = query.order_by(desc(LostReport.created_at))
        
    reports = query.offset(skip).limit(limit).all()
    return [to_response(r, current_user) for r in reports]

@router.post("", response_model=LostReportResponse, status_code=status.HTTP_201_CREATED)
def create_lost_report(
    data: LostReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report_id = generate_report_id()
    new_report = LostReport(
        report_id=report_id,
        user_id=current_user.id,
        item_name=data.item_name.strip(),
        category=data.category.strip(),
        description=data.description.strip(),
        lost_date=data.lost_date,
        approx_time=data.approx_time.strip(),
        location=data.location.strip(),
        colour=data.colour.strip(),
        brand=data.brand.strip() if data.brand else None,
        additional_details=data.additional_details.strip() if data.additional_details else None,
        status="active"
    )
    db.add(new_report)
    db.flush()

    # Link images if supplied
    if data.image_paths:
        for idx, path in enumerate(data.image_paths):
            filename = path.split("/")[-1]
            img = ItemImage(
                lost_report_id=new_report.id,
                file_path=path,
                filename=filename,
                file_size=1024,
                mime_type="image/jpeg",
                is_primary=(idx == 0)
            )
            db.add(img)
            db.flush()

            # Add embedding if present
            if data.embeddings and idx < len(data.embeddings) and data.embeddings[idx]:
                emb = ImageEmbedding(
                    item_image_id=img.id,
                    lost_report_id=new_report.id,
                    embedding_json=json.dumps(data.embeddings[idx]),
                    vector_dim=len(data.embeddings[idx])
                )
                db.add(emb)

    db.commit()
    db.refresh(new_report)
    return to_response(new_report, current_user)

@router.get("/{id_or_code}", response_model=LostReportResponse)
def get_lost_report_detail(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if id_or_code.isdigit():
        report = db.query(LostReport).filter(LostReport.id == int(id_or_code)).first()
    else:
        report = db.query(LostReport).filter(LostReport.report_id == id_or_code.strip().upper()).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost item report not found."
        )
    return to_response(report, current_user)

@router.put("/{id}", response_model=LostReportResponse)
def update_lost_report(
    id: int,
    data: LostReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(LostReport).filter(LostReport.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this report."
        )
    
    if report.status in ["resolved", "withdrawn"]:
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

@router.post("/{id}/withdraw", response_model=LostReportResponse)
def withdraw_lost_report(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(LostReport).filter(LostReport.id == id).first()
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
