from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import date, datetime

# Token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# User Schemas
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    account_type: str = Field(..., pattern="^(student|staff)$")
    mobile_number: str = Field(..., min_length=10, max_length=15)
    reg_number: str = Field(..., min_length=4, max_length=50)
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    
    # Conditional student fields
    academic_year: Optional[str] = None
    branch: Optional[str] = None
    
    # Conditional staff fields
    department: Optional[str] = None
    designation: Optional[str] = None

class UserLoginRequest(BaseModel):
    reg_number: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class UserResponsePublic(BaseModel):
    id: int
    full_name: str
    account_type: str

class UserResponsePrivate(BaseModel):
    id: int
    reg_number: str
    full_name: str
    account_type: str
    mobile_number: str
    academic_year: Optional[str] = None
    branch: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    academic_year: Optional[str] = None
    branch: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None

class UserChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

# Location
class CampusLocationResponse(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Images
class ItemImageResponse(BaseModel):
    id: int
    file_path: str
    filename: str
    file_size: int
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)

# Lost Reports
class LostReportCreate(BaseModel):
    item_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=5)
    lost_date: date
    approx_time: str = Field(..., min_length=1, max_length=50)
    location: str = Field(..., min_length=2, max_length=100)
    colour: str = Field(..., min_length=2, max_length=50)
    brand: Optional[str] = None
    additional_details: Optional[str] = None
    image_paths: Optional[List[str]] = []
    embeddings: Optional[List[List[float]]] = None

class LostReportUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    lost_date: Optional[date] = None
    approx_time: Optional[str] = None
    location: Optional[str] = None
    colour: Optional[str] = None
    brand: Optional[str] = None
    additional_details: Optional[str] = None

class LostReportResponse(BaseModel):
    id: int
    report_id: str
    item_name: str
    category: str
    description: str
    lost_date: date
    approx_time: str
    location: str
    colour: str
    brand: Optional[str] = None
    additional_details: Optional[str] = None
    status: str
    created_at: datetime
    images: List[ItemImageResponse] = []
    is_owner: bool = False
    reporter_name: Optional[str] = None
    reporter_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Found Reports
class FoundReportCreate(BaseModel):
    item_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=5)
    found_date: date
    approx_time: str = Field(..., min_length=1, max_length=50)
    location: str = Field(..., min_length=2, max_length=100)
    colour: str = Field(..., min_length=2, max_length=50)
    brand: Optional[str] = None
    additional_observations: Optional[str] = None
    image_paths: List[str] = []
    embeddings: Optional[List[List[float]]] = None

class FoundReportUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    found_date: Optional[date] = None
    approx_time: Optional[str] = None
    location: Optional[str] = None
    colour: Optional[str] = None
    brand: Optional[str] = None
    additional_observations: Optional[str] = None

class FoundReportResponse(BaseModel):
    id: int
    report_id: str
    item_name: str
    category: str
    description: str
    found_date: date
    approx_time: str
    location: str
    colour: str
    brand: Optional[str] = None
    additional_observations: Optional[str] = None
    status: str
    created_at: datetime
    images: List[ItemImageResponse] = []
    is_owner: bool = False
    reporter_name: Optional[str] = None
    reporter_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Recovery Request
class RecoveryRequestCreate(BaseModel):
    lost_report_id: int
    found_report_id: int
    message: Optional[str] = None

class RecoveryRequestResponse(BaseModel):
    id: int
    request_code: str
    lost_report_id: int
    found_report_id: int
    lost_report: Optional[LostReportResponse] = None
    found_report: Optional[FoundReportResponse] = None
    requesting_user_id: int
    receiving_user_id: int
    message: Optional[str] = None
    status: str
    lost_user_confirmed_return: bool
    found_user_confirmed_return: bool
    created_at: datetime
    updated_at: datetime
    is_requesting_user: bool = False
    is_receiving_user: bool = False
    partner_profile: Optional[UserResponsePrivate] = None  # Populated ONLY after acceptance!

    model_config = ConfigDict(from_attributes=True)

# Messaging
class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    content: str
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    is_mine: bool = False

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: int
    recovery_request_id: int
    request_code: str
    item_name: str
    partner_id: int
    partner_name: str
    partner_type: str
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Notification
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Feedback
class FeedbackCreate(BaseModel):
    recovery_request_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=1000)
    recovery_experience: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    recovery_request_id: int
    user_id: int
    user_name: str
    rating: int
    comment: str
    recovery_experience: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Moderation / Safety
class UserReportCreate(BaseModel):
    reported_user_id: Optional[int] = None
    conversation_id: Optional[int] = None
    reason: str = Field(..., min_length=3, max_length=100)
    details: str = Field(..., min_length=5)

class BlockCreate(BaseModel):
    blocked_id: int

# Image Search Match
class ImageSearchMatchItem(BaseModel):
    report_type: str  # "lost" or "found"
    report_id: str
    item_id: int
    item_name: str
    category: str
    location: str
    date: str
    colour: str
    brand: Optional[str] = None
    description: str
    photograph: Optional[str] = None
    similarity_score: float
    visual_similarity: float
    category_match: bool
    color_match: bool
    location_match: bool
    factors: Dict[str, float]

class StatsResponse(BaseModel):
    total_lost_reports: int
    total_found_reports: int
    active_recovery_requests: int
    successfully_returned_items: int
    user_lost_reports: int
    user_found_reports: int
    user_active_recoveries: int
    unread_messages: int
    unread_notifications: int
