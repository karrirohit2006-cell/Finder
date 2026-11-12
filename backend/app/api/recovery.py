import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List, Optional

from backend.app.db.session import get_db
from backend.app.models.models import (
    RecoveryRequest,
    LostReport,
    FoundReport,
    User,
    Conversation,
    Notification
)
from backend.app.schemas.schemas import (
    RecoveryRequestCreate,
    RecoveryRequestResponse,
    UserResponsePrivate
)
from backend.app.api.deps import get_current_user
from backend.app.services.notification_service import send_notification
from backend.app.api.lost_reports import to_response as lost_to_response
from backend.app.api.found_reports import to_response as found_to_response

router = APIRouter(prefix="/recovery", tags=["Recovery Requests"])

def generate_request_code() -> str:
    now = datetime.datetime.now()
    suffix = uuid.uuid4().hex[:6].upper()
    return f"REC-{now.year}-{suffix}"

def to_recovery_response(req: RecoveryRequest, current_user: User) -> dict:
    is_requester = (current_user.id == req.requesting_user_id)
    is_receiver = (current_user.id == req.receiving_user_id)

    # Privacy Protection Rule:
    # Only reveal contact info IF request status is 'accepted' or 'completed' AND user is one of the 2 participants!
    partner_profile = None
    if req.status in ["accepted", "completed"] and (is_requester or is_receiver):
        partner = req.receiving_user if is_requester else req.requesting_user
        if partner:
            partner_profile = {
                "id": partner.id,
                "reg_number": partner.reg_number,
                "full_name": partner.full_name,
                "account_type": partner.account_type,
                "mobile_number": partner.mobile_number,
                "academic_year": partner.academic_year,
                "branch": partner.branch,
                "department": partner.department,
                "designation": partner.designation,
                "created_at": partner.created_at
            }

    return {
        "id": req.id,
        "request_code": req.request_code,
        "lost_report_id": req.lost_report_id,
        "found_report_id": req.found_report_id,
        "lost_report": lost_to_response(req.lost_report, current_user) if req.lost_report else None,
        "found_report": found_to_response(req.found_report, current_user) if req.found_report else None,
        "requesting_user_id": req.requesting_user_id,
        "receiving_user_id": req.receiving_user_id,
        "message": req.message,
        "status": req.status,
        "lost_user_confirmed_return": req.lost_user_confirmed_return,
        "found_user_confirmed_return": req.found_user_confirmed_return,
        "created_at": req.created_at,
        "updated_at": req.updated_at,
        "is_requesting_user": is_requester,
        "is_receiving_user": is_receiver,
        "partner_profile": partner_profile
    }

@router.get("", response_model=List[RecoveryRequestResponse])
def get_my_recovery_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(RecoveryRequest).filter(
        or_(
            RecoveryRequest.requesting_user_id == current_user.id,
            RecoveryRequest.receiving_user_id == current_user.id
        )
    )
    if status_filter and status_filter != "all":
        query = query.filter(RecoveryRequest.status == status_filter)

    requests = query.order_by(desc(RecoveryRequest.created_at)).all()
    return [to_recovery_response(r, current_user) for r in requests]

@router.post("", response_model=RecoveryRequestResponse, status_code=status.HTTP_201_CREATED)
def create_recovery_request(
    data: RecoveryRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lost = db.query(LostReport).filter(LostReport.id == data.lost_report_id).first()
    found = db.query(FoundReport).filter(FoundReport.id == data.found_report_id).first()

    if not lost or not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost or Found report not found."
        )

    # Determine recipient
    # If current_user owns the found item, recipient is lost owner
    # If current_user owns the lost item, recipient is found owner
    if current_user.id == found.user_id:
        receiving_user_id = lost.user_id
    elif current_user.id == lost.user_id:
        receiving_user_id = found.user_id
    else:
        # User doesn't own either report
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be the reporter of either the lost or found item to initiate a recovery request."
        )

    if receiving_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send recovery request to yourself."
        )

    # Duplicate Prevention
    existing = db.query(RecoveryRequest).filter(
        RecoveryRequest.lost_report_id == lost.id,
        RecoveryRequest.found_report_id == found.id,
        RecoveryRequest.status.in_(["pending", "accepted"])
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An active recovery request ({existing.request_code}) already exists for this item pair."
        )

    request_code = generate_request_code()
    req = RecoveryRequest(
        request_code=request_code,
        lost_report_id=lost.id,
        found_report_id=found.id,
        requesting_user_id=current_user.id,
        receiving_user_id=receiving_user_id,
        message=data.message.strip() if data.message else None,
        status="pending"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    # Notify recipient
    send_notification(
        db=db,
        user_id=receiving_user_id,
        title="New Recovery Request Received",
        message=f"{current_user.full_name} sent a recovery request for '{lost.item_name}' / '{found.item_name}'.",
        type="recovery_request",
        link=f"/recovery/{req.request_code}"
    )

    return to_recovery_response(req, current_user)

@router.get("/{id_or_code}", response_model=RecoveryRequestResponse)
def get_recovery_request_detail(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if id_or_code.isdigit():
        req = db.query(RecoveryRequest).filter(RecoveryRequest.id == int(id_or_code)).first()
    else:
        req = db.query(RecoveryRequest).filter(RecoveryRequest.request_code == id_or_code.strip().upper()).first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery request not found.")

    if current_user.id not in [req.requesting_user_id, req.receiving_user_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return to_recovery_response(req, current_user)

@router.post("/{id_or_code}/accept", response_model=RecoveryRequestResponse)
def accept_recovery_request(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if id_or_code.isdigit():
        req = db.query(RecoveryRequest).filter(RecoveryRequest.id == int(id_or_code)).first()
    else:
        req = db.query(RecoveryRequest).filter(RecoveryRequest.request_code == id_or_code.strip().upper()).first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery request not found.")

    # Only receiving user can accept
    if current_user.id != req.receiving_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recipient of the request can accept it."
        )

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot accept request with status '{req.status}'."
        )

    req.status = "accepted"

    # Update item statuses
    if req.lost_report:
        req.lost_report.status = "recovery_pending"
    if req.found_report:
        req.found_report.status = "recovery_pending"

    # Create Conversation for private messaging
    existing_conv = db.query(Conversation).filter(Conversation.recovery_request_id == req.id).first()
    if not existing_conv:
        conv = Conversation(
            recovery_request_id=req.id,
            user1_id=req.requesting_user_id,
            user2_id=req.receiving_user_id
        )
        db.add(conv)

    db.commit()
    db.refresh(req)

    # Notify requester
    send_notification(
        db=db,
        user_id=req.requesting_user_id,
        title="Recovery Request Accepted!",
        message=f"{current_user.full_name} accepted your recovery request ({req.request_code}). Contact details and private chat are now unlocked.",
        type="request_accepted",
        link=f"/recovery/{req.request_code}"
    )

    return to_recovery_response(req, current_user)

@router.post("/{id_or_code}/reject", response_model=RecoveryRequestResponse)
def reject_recovery_request(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if id_or_code.isdigit():
        req = db.query(RecoveryRequest).filter(RecoveryRequest.id == int(id_or_code)).first()
    else:
        req = db.query(RecoveryRequest).filter(RecoveryRequest.request_code == id_or_code.strip().upper()).first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery request not found.")

    if current_user.id != req.receiving_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recipient of the request can reject it."
        )

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject request with status '{req.status}'."
        )

    req.status = "rejected"
    db.commit()
    db.refresh(req)

    # Notify requester
    send_notification(
        db=db,
        user_id=req.requesting_user_id,
        title="Recovery Request Declined",
        message=f"{current_user.full_name} declined recovery request ({req.request_code}). Contact details remain private.",
        type="request_rejected",
        link=f"/recovery/{req.request_code}"
    )

    return to_recovery_response(req, current_user)

@router.post("/{id_or_code}/cancel", response_model=RecoveryRequestResponse)
def cancel_recovery_request(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if id_or_code.isdigit():
        req = db.query(RecoveryRequest).filter(RecoveryRequest.id == int(id_or_code)).first()
    else:
        req = db.query(RecoveryRequest).filter(RecoveryRequest.request_code == id_or_code.strip().upper()).first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery request not found.")

    if current_user.id != req.requesting_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the sender can cancel this request."
        )

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel request with status '{req.status}'."
        )

    req.status = "cancelled"
    db.commit()
    db.refresh(req)
    return to_recovery_response(req, current_user)

@router.post("/{id_or_code}/confirm-return", response_model=RecoveryRequestResponse)
def confirm_return(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Two-Party Confirmation of Return:
    Both participants must confirm before marking recovery completed!
    """
    if id_or_code.isdigit():
        req = db.query(RecoveryRequest).filter(RecoveryRequest.id == int(id_or_code)).first()
    else:
        req = db.query(RecoveryRequest).filter(RecoveryRequest.request_code == id_or_code.strip().upper()).first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recovery request not found.")

    if current_user.id not in [req.requesting_user_id, req.receiving_user_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    if req.status != "accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item return can only be confirmed for accepted recovery requests."
        )

    is_lost_owner = (current_user.id == req.lost_report.user_id) if req.lost_report else False
    is_found_owner = (current_user.id == req.found_report.user_id) if req.found_report else False

    if is_lost_owner:
        req.lost_user_confirmed_return = True
    elif is_found_owner:
        req.found_user_confirmed_return = True
    else:
        # Requester/receiver fallback
        if current_user.id == req.requesting_user_id:
            req.lost_user_confirmed_return = True
        else:
            req.found_user_confirmed_return = True

    partner_id = req.receiving_user_id if current_user.id == req.requesting_user_id else req.requesting_user_id

    # Check if both have confirmed
    if req.lost_user_confirmed_return and req.found_user_confirmed_return:
        req.status = "completed"
        if req.lost_report:
            req.lost_report.status = "resolved"
        if req.found_report:
            req.found_report.status = "returned"

        # Send completion and feedback reminder notifications to both!
        for uid in [req.requesting_user_id, req.receiving_user_id]:
            send_notification(
                db=db,
                user_id=uid,
                title="Recovery Completed!",
                message=f"Item recovery for '{req.lost_report.item_name if req.lost_report else 'item'}' is successfully confirmed by both parties! Please share your feedback.",
                type="recovery_completed",
                link=f"/feedback/new?request_code={req.request_code}"
            )
    else:
        # Notify the other party that one confirmation has been recorded
        send_notification(
            db=db,
            user_id=partner_id,
            title="Return Confirmation Recorded",
            message=f"{current_user.full_name} confirmed that the item has been returned. Please confirm from your end to complete the recovery.",
            type="return_confirmed",
            link=f"/recovery/{req.request_code}"
        )

    db.commit()
    db.refresh(req)
    return to_recovery_response(req, current_user)
