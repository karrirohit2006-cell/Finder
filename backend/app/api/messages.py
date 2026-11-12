import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List

from backend.app.db.session import get_db
from backend.app.models.models import Conversation, Message, User, RecoveryRequest, Block
from backend.app.schemas.schemas import MessageCreate, MessageResponse, ConversationResponse
from backend.app.api.deps import get_current_user
from backend.app.services.notification_service import send_notification

router = APIRouter(prefix="/messages", tags=["Private Messaging"])

def to_message_response(msg: Message, current_user: User) -> dict:
    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "sender_name": msg.sender.full_name if msg.sender else "User",
        "content": msg.content,
        "is_read": msg.is_read,
        "read_at": msg.read_at,
        "created_at": msg.created_at,
        "is_mine": (msg.sender_id == current_user.id)
    }

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    convs = db.query(Conversation).filter(
        or_(Conversation.user1_id == current_user.id, Conversation.user2_id == current_user.id)
    ).order_by(desc(Conversation.updated_at)).all()

    results = []
    for c in convs:
        # Check that the underlying recovery request is accepted or completed
        req = c.recovery_request
        if not req or req.status not in ["accepted", "completed"]:
            continue

        partner = c.user2 if c.user1_id == current_user.id else c.user1
        last_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(desc(Message.created_at)).first()
        unread_cnt = db.query(Message).filter(
            Message.conversation_id == c.id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        ).count()

        item_title = "Item Recovery"
        if req.lost_report:
            item_title = req.lost_report.item_name
        elif req.found_report:
            item_title = req.found_report.item_name

        results.append({
            "id": c.id,
            "recovery_request_id": req.id,
            "request_code": req.request_code,
            "item_name": item_title,
            "partner_id": partner.id if partner else 0,
            "partner_name": partner.full_name if partner else "Community Member",
            "partner_type": partner.account_type if partner else "student",
            "last_message": to_message_response(last_msg, current_user) if last_msg else None,
            "unread_count": unread_cnt,
            "updated_at": c.updated_at
        })
    return results

@router.get("/conversations/{conv_id}", response_model=List[MessageResponse])
def get_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    if current_user.id not in [conv.user1_id, conv.user2_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this conversation.")

    req = conv.recovery_request
    if not req or req.status not in ["accepted", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Private messaging is only enabled for accepted recovery requests."
        )

    # Mark incoming messages as read
    now = datetime.datetime.now(datetime.timezone.utc)
    unread_msgs = db.query(Message).filter(
        Message.conversation_id == conv_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).all()
    for m in unread_msgs:
        m.is_read = True
        m.read_at = now
    if unread_msgs:
        db.commit()

    messages = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.created_at.asc()).all()
    return [to_message_response(m, current_user) for m in messages]

@router.post("/conversations/{conv_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    conv_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    if current_user.id not in [conv.user1_id, conv.user2_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this conversation.")

    req = conv.recovery_request
    if not req or req.status not in ["accepted", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot send messages because this recovery request is not active."
        )

    partner_id = conv.user2_id if conv.user1_id == current_user.id else conv.user1_id

    # Check if blocked
    blocked = db.query(Block).filter(
        or_(
            and_(Block.blocker_id == current_user.id, Block.blocked_id == partner_id),
            and_(Block.blocker_id == partner_id, Block.blocked_id == current_user.id)
        )
    ).first()
    if blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unable to deliver message due to active block."
        )

    new_msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=data.content.strip(),
        is_read=False
    )
    db.add(new_msg)
    conv.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(new_msg)

    # Real notification to partner
    send_notification(
        db=db,
        user_id=partner_id,
        title="New Message Received",
        message=f"{current_user.full_name}: {new_msg.content[:60]}...",
        type="new_message",
        link=f"/messages?conv={conv.id}"
    )

    return to_message_response(new_msg, current_user)
