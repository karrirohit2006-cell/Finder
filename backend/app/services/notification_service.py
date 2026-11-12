from sqlalchemy.orm import Session
from backend.app.models.models import Notification

def send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: str,
    link: str = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        link=link,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
