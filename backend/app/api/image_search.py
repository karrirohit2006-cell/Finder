import json
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from backend.app.db.session import get_db
from backend.app.models.models import FoundReport, LostReport, ItemImage, ImageEmbedding
from backend.app.services.vision_service import extract_image_embedding, cosine_similarity, compute_multi_factor_match
from backend.app.schemas.schemas import ImageSearchMatchItem
from backend.app.core.config import settings

router = APIRouter(prefix="/search", tags=["Image and Keyword Search"])

@router.post("/by-image", response_model=List[ImageSearchMatchItem])
async def search_by_image(
    file: Optional[UploadFile] = File(None),
    target_type: str = Form("found", description="Search among 'found' items or 'lost' items"),
    category: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    colour: Optional[str] = Form(None),
    keyword: Optional[str] = Form(None),
    date_str: Optional[str] = Form(None),
    min_similarity: float = Form(25.0, description="Minimum similarity percentage (0-100)"),
    limit: int = Form(30),
    db: Session = Depends(get_db)
):
    query_emb = None
    if file and file.filename:
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image format. Allowed: JPEG, PNG, WebP."
            )
        contents = await file.read()
        if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image exceeds {settings.MAX_FILE_SIZE_MB}MB limit."
            )
        try:
            query_emb = extract_image_embedding(contents)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to process image features: {str(e)}"
            )

    parsed_date = None
    if date_str:
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except Exception:
            pass

    results = []

    # Choose dataset to search
    if target_type == "lost":
        reports = db.query(LostReport).filter(LostReport.status.in_(["active", "match_found"])).all()
    else:
        reports = db.query(FoundReport).filter(FoundReport.status == "active").all()

    for item in reports:
        # Category filter
        if category and category.lower() != "all" and item.category.lower() != category.lower():
            continue

        # Location filter
        if location and location.lower() != "all" and location.lower() not in item.location.lower():
            continue

        # Color filter
        if colour and colour.lower() != "all" and colour.lower() not in item.colour.lower():
            continue

        # Keyword filter if provided
        if keyword:
            kw = keyword.lower()
            text_corpus = f"{item.item_name} {item.description} {item.colour} {item.brand or ''} {item.location}".lower()
            if kw not in text_corpus:
                continue

        # Visual similarity computation
        item_emb = None
        photo_url = None
        if item.images and len(item.images) > 0:
            photo_url = item.images[0].file_path
            for img in item.images:
                if img.embedding:
                    try:
                        item_emb = json.loads(img.embedding.embedding_json)
                        break
                    except Exception:
                        pass

        # Compute cosine similarity if both embeddings exist
        if query_emb and item_emb:
            visual_sim = cosine_similarity(query_emb, item_emb)
        else:
            # Fallback when one or both have no image: neutral 0.40 baseline
            visual_sim = 0.40

        item_date = getattr(item, "found_date", None) or getattr(item, "lost_date", None)

        match_details = compute_multi_factor_match(
            visual_sim=visual_sim,
            query_category=category or (item.category if not file else None),
            target_category=item.category,
            query_color=colour,
            target_color=item.colour,
            query_location=location,
            target_location=item.location,
            query_date=parsed_date,
            target_date=item_date
        )

        sim_score = match_details["similarity_score"]
        if sim_score >= min_similarity:
            results.append({
                "report_type": "lost" if target_type == "lost" else "found",
                "report_id": item.report_id,
                "item_id": item.id,
                "item_name": item.item_name,
                "category": item.category,
                "location": item.location,
                "date": item_date.isoformat() if item_date else "",
                "colour": item.colour,
                "brand": item.brand,
                "description": item.description,
                "photograph": photo_url,
                "similarity_score": sim_score,
                "visual_similarity": match_details["visual_similarity"],
                "category_match": match_details["category_match"],
                "color_match": match_details["color_match"],
                "location_match": match_details["location_match"],
                "factors": match_details["factors"]
            })

    # Sort descending by similarity score
    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return results[:limit]
