import os
import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Back2You"
    PROJECT_TAGLINE: str = "Lost something? Found something? Let's bring it Back2You."
    API_V1_STR: str = "/api/v1"
    
    # Database
    default_db: str = "sqlite:////tmp/back2you.db" if os.getenv("VERCEL") else "sqlite:///./back2you.db"
    DATABASE_URL: str = os.getenv("DATABASE_URL", default_db)
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-back2you-production-key-2026-lpu-lost-found")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
    
    # Uploads
    default_uploads_dir: str = "/tmp/uploads" if os.getenv("VERCEL") else os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", default_uploads_dir)
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    
    # Campus Information / Student Services
    STUDENT_SERVICES_ROOM: str = "Room 302, Block 32 (Student Welfare Division)"
    STUDENT_SERVICES_EMAIL: str = "studentservices@lpu.co.in"
    STUDENT_SERVICES_PHONE: str = "+91 1824 517000 / Ext. 3201"
    STUDENT_SERVICES_HOURS: str = "Monday - Saturday: 9:00 AM - 5:00 PM"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]

settings = Settings()

