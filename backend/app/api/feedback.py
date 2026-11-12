from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any

from backend.app.db.session import get_db
from backend.app.models.models import Feedback, RecoveryRequest, User
from backend.app.schemas.schemas import FeedbackCreate, FeedbackResponse
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.get("", response_model=List[FeedbackResponse])
def get_public_feedback(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    feedbacks = db.query(Feedback).order_by(desc(Feedback.created_at)).limit(limit).all()
    return [
        {
            "id": f.id,
            "recovery_request_id": f.recovery_request_id,
            "user_id": f.user_id,
            "user_name": f.user.full_name if f.user else "LPU Member",
            "rating": f.rating,
            "comment": f.comment,
            "recovery_experience": f.recovery_experience,
            "created_at": f.created_at
        }
        for f in feedbacks
    ]

@router.get("/summary")
def get_feedback_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    stats = db.query(
        func.count(Feedback.id).label("total"),
        func.avg(Feedback.rating).label("avg_rating")
    ).first()
    
    total = stats.total if stats else 0
    avg = float(stats.avg_rating) if (stats and stats.avg_rating) else 5.0
    return {
        "total_feedbacks": total,
        "average_rating": round(avg, 1)
    }

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(RecoveryRequest).filter(RecoveryRequest.id == data.recovery_request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery request not found.")

    # Rule: Only participants of that recovery can submit feedback
    if current_user.id not in [req.requesting_user_id, req.receiving_user_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only participants in this recovery can submit feedback."
        )

    # Rule: Only completed recovery can receive feedback
    if req.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Feedback can only be submitted after recovery is completed. Current status: '{req.status}'."
        )

    # Rule: One feedback submission per participant per recovery (Prevent duplicate)
    existing = db.query(Feedback).filter(
        Feedback.recovery_request_id == req.id,
        Feedback.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted feedback for this recovery."
        )

    fb = Feedback(
        recovery_request_id=req.id,
        user_id=current_user.id,
        rating=data.rating,
        comment=data.comment.strip(),
        recovery_experience=data.recovery_experience.strip() if data.recovery_experience else "Smooth"
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    return {
        "id": fb.id,
        "recovery_request_id": fb.recovery_request_id,
        "user_id": fb.user_id,
        "user_name": current_user.full_name,
        "rating": fb.rating,
        "comment": fb.comment,
        "recovery_experience": fb.recovery_experience,
        "created_at": fb.created_at
    }
