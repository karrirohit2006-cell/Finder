import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    reg_number = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    account_type = Column(String(20), nullable=False)  # "student" or "staff"
    mobile_number = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Student specific fields
    academic_year = Column(String(50), nullable=True)
    branch = Column(String(100), nullable=True)
    
    # Staff specific fields
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    lost_reports = relationship("LostReport", back_populates="user", cascade="all, delete-orphan")
    found_reports = relationship("FoundReport", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    feedback_submissions = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")

class CampusLocation(Base):
    __tablename__ = "campus_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False)  # Academic blocks, Library, Hostels, Cafeteria, Sports complex, etc.
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

class LostReport(Base):
    __tablename__ = "lost_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(30), unique=True, index=True, nullable=False)  # e.g. LOST-2026-XXXX
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    lost_date = Column(Date, nullable=False)
    approx_time = Column(String(50), nullable=False)
    location = Column(String(100), nullable=False, index=True)
    colour = Column(String(50), nullable=False)
    brand = Column(String(100), nullable=True)
    additional_details = Column(Text, nullable=True)
    status = Column(String(30), default="active", nullable=False, index=True)  # active, match_found, recovery_pending, resolved, withdrawn
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="lost_reports")
    images = relationship("ItemImage", back_populates="lost_report", cascade="all, delete-orphan")
    recovery_requests = relationship("RecoveryRequest", back_populates="lost_report", cascade="all, delete-orphan")

class FoundReport(Base):
    __tablename__ = "found_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(30), unique=True, index=True, nullable=False)  # e.g. FOUND-2026-XXXX
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    found_date = Column(Date, nullable=False)
    approx_time = Column(String(50), nullable=False)
    location = Column(String(100), nullable=False, index=True)
    colour = Column(String(50), nullable=False)
    brand = Column(String(100), nullable=True)
    additional_observations = Column(Text, nullable=True)
    status = Column(String(30), default="active", nullable=False, index=True)  # active, recovery_pending, returned, withdrawn
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="found_reports")
    images = relationship("ItemImage", back_populates="found_report", cascade="all, delete-orphan")
    recovery_requests = relationship("RecoveryRequest", back_populates="found_report", cascade="all, delete-orphan")

class ItemImage(Base):
    __tablename__ = "item_images"

    id = Column(Integer, primary_key=True, index=True)
    lost_report_id = Column(Integer, ForeignKey("lost_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    found_report_id = Column(Integer, ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    file_path = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(50), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    lost_report = relationship("LostReport", back_populates="images")
    found_report = relationship("FoundReport", back_populates="images")
    embedding = relationship("ImageEmbedding", uselist=False, back_populates="image", cascade="all, delete-orphan")

class ImageEmbedding(Base):
    __tablename__ = "image_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    item_image_id = Column(Integer, ForeignKey("item_images.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    found_report_id = Column(Integer, ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    lost_report_id = Column(Integer, ForeignKey("lost_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    embedding_json = Column(Text, nullable=False)  # JSON serialized float array
    vector_dim = Column(Integer, default=128, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    image = relationship("ItemImage", back_populates="embedding")

class RecoveryRequest(Base):
    __tablename__ = "recovery_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_code = Column(String(30), unique=True, index=True, nullable=False)  # e.g. REC-2026-XXXX
    lost_report_id = Column(Integer, ForeignKey("lost_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    found_report_id = Column(Integer, ForeignKey("found_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    requesting_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiving_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=True)
    status = Column(String(30), default="pending", nullable=False, index=True)  # pending, accepted, rejected, cancelled, completed
    
    # Confirmation of return from both parties
    lost_user_confirmed_return = Column(Boolean, default=False, nullable=False)
    found_user_confirmed_return = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    lost_report = relationship("LostReport", back_populates="recovery_requests")
    found_report = relationship("FoundReport", back_populates="recovery_requests")
    requesting_user = relationship("User", foreign_keys=[requesting_user_id])
    receiving_user = relationship("User", foreign_keys=[receiving_user_id])
    conversation = relationship("Conversation", uselist=False, back_populates="recovery_request", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="recovery_request", cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    recovery_request_id = Column(Integer, ForeignKey("recovery_requests.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    user1_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user2_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    recovery_request = relationship("RecoveryRequest", back_populates="conversation")
    user1 = relationship("User", foreign_keys=[user1_id])
    user2 = relationship("User", foreign_keys=[user2_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, index=True)  # recovery_request, request_accepted, request_rejected, request_cancelled, new_message, return_confirmed, recovery_completed, possible_match, feedback_reminder
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")

class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (
        UniqueConstraint("recovery_request_id", "user_id", name="uq_recovery_feedback_user"),
    )

    id = Column(Integer, primary_key=True, index=True)
    recovery_request_id = Column(Integer, ForeignKey("recovery_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=False)
    recovery_experience = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    recovery_request = relationship("RecoveryRequest", back_populates="feedbacks")
    user = relationship("User", back_populates="feedback_submissions")

class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    reason = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    status = Column(String(30), default="filed", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])

class Block(Base):
    __tablename__ = "blocks"
    __table_args__ = (
        UniqueConstraint("blocker_id", "blocked_id", name="uq_blocker_blocked"),
    )

    id = Column(Integer, primary_key=True, index=True)
    blocker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    blocked_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    blocker = relationship("User", foreign_keys=[blocker_id])
    blocked = relationship("User", foreign_keys=[blocked_id])
