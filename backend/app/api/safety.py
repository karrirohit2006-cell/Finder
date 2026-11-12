from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.session import get_db
from backend.app.models.models import UserReport, Block, User
from backend.app.schemas.schemas import UserReportCreate, BlockCreate
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/safety", tags=["Safety & Moderation"])

@router.post("/report-user", status_code=status.HTTP_201_CREATED)
def report_user(
    data: UserReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.reported_user_id and data.reported_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot file a safety report against yourself."
        )

    report = UserReport(
        reporter_id=current_user.id,
        reported_user_id=data.reported_user_id,
        conversation_id=data.conversation_id,
        reason=data.reason.strip(),
        details=data.details.strip(),
        status="filed"
    )
    db.add(report)
    db.commit()

    return {
        "message": "Safety report filed for university record. Note: Reports are not automatically reviewed by an administrator. For urgent matters, please contact LPU Student Services or Security directly.",
        "report_id": report.id
    }

@router.post("/block-user")
def block_user(
    data: BlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.blocked_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot block yourself.")

    existing = db.query(Block).filter(
        Block.blocker_id == current_user.id,
        Block.blocked_id == data.blocked_id
    ).first()
    if existing:
        return {"message": "User is already blocked."}

    block_record = Block(
        blocker_id=current_user.id,
        blocked_id=data.blocked_id
    )
    db.add(block_record)
    db.commit()
    return {"message": "User has been blocked. They cannot send you direct messages."}

@router.delete("/unblock-user/{user_id}")
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    block = db.query(Block).filter(
        Block.blocker_id == current_user.id,
        Block.blocked_id == user_id
    ).first()
    if block:
        db.delete(block)
        db.commit()
    return {"message": "User unblocked."}
