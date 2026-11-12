from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc
from typing import Dict, Any, List

from backend.app.db.session import get_db
from backend.app.models.models import (
    User,
    LostReport,
    FoundReport,
    RecoveryRequest,
    Message,
    Notification,
    Conversation
)
from backend.app.schemas.schemas import (
    UserResponsePrivate,
    UserUpdateRequest,
    StatsResponse,
    LostReportResponse,
    FoundReportResponse
)
from backend.app.api.deps import get_current_user
from backend.app.api.lost_reports import to_response as lost_to_response
from backend.app.api.found_reports import to_response as found_to_response

router = APIRouter(prefix="/users", tags=["Users & Dashboard"])

@router.get("/profile", response_model=UserResponsePrivate)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponsePrivate)
def update_user_profile(
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.full_name is not None and data.full_name.strip():
        current_user.full_name = data.full_name.strip()
    if data.mobile_number is not None and data.mobile_number.strip():
        current_user.mobile_number = data.mobile_number.strip()
    
    if current_user.account_type == "student":
        if data.academic_year is not None:
            current_user.academic_year = data.academic_year.strip()
        if data.branch is not None:
            current_user.branch = data.branch.strip()
    elif current_user.account_type == "staff":
        if data.department is not None:
            current_user.department = data.department.strip()
        if data.designation is not None:
            current_user.designation = data.designation.strip()

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/stats", response_model=StatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Overall platform stats from actual database
    total_lost = db.query(LostReport).filter(LostReport.status != "withdrawn").count()
    total_found = db.query(FoundReport).filter(FoundReport.status != "withdrawn").count()
    active_recs = db.query(RecoveryRequest).filter(RecoveryRequest.status.in_(["pending", "accepted"])).count()
    returned_items = db.query(RecoveryRequest).filter(RecoveryRequest.status == "completed").count()

    # User specific stats
    user_lost = db.query(LostReport).filter(LostReport.user_id == current_user.id).count()
    user_found = db.query(FoundReport).filter(FoundReport.user_id == current_user.id).count()
    user_active_rec = db.query(RecoveryRequest).filter(
        or_(RecoveryRequest.requesting_user_id == current_user.id, RecoveryRequest.receiving_user_id == current_user.id),
        RecoveryRequest.status.in_(["pending", "accepted"])
    ).count()

    unread_msgs = db.query(Message).join(Conversation).filter(
        or_(Conversation.user1_id == current_user.id, Conversation.user2_id == current_user.id),
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).count()

    unread_notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {
        "total_lost_reports": total_lost,
        "total_found_reports": total_found,
        "active_recovery_requests": active_recs,
        "successfully_returned_items": returned_items,
        "user_lost_reports": user_lost,
        "user_found_reports": user_found,
        "user_active_recoveries": user_active_rec,
        "unread_messages": unread_msgs,
        "unread_notifications": unread_notifs
    }

@router.get("/history")
def get_user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lost_items = db.query(LostReport).filter(LostReport.user_id == current_user.id).order_by(desc(LostReport.created_at)).all()
    found_items = db.query(FoundReport).filter(FoundReport.user_id == current_user.id).order_by(desc(FoundReport.created_at)).all()
    
    return {
        "lost_reports": [lost_to_response(r, current_user) for r in lost_items],
        "found_reports": [found_to_response(r, current_user) for r in found_items]
    }
