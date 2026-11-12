import os
import uuid
from PIL import Image
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from typing import List, Dict, Any

from backend.app.core.config import settings
from backend.app.api.deps import get_current_user
from backend.app.models.models import User
from backend.app.services.vision_service import extract_image_embedding

router = APIRouter(prefix="/uploads", tags=["Uploads"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/image")
async def upload_single_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    # 1. Validate content type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image type ({file.content_type}). Allowed types: JPEG, PNG, WebP."
        )
    
    # 2. Read bytes and validate file size (max 10MB)
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds {settings.MAX_FILE_SIZE_MB}MB limit."
        )
    
    # 3. Validate image integrity and dimensions using PIL
    try:
        image = Image.open(io_bytes := io_open(contents))
        image.verify()  # Verify that it's a valid image
        width, height = image.size
        if width < 30 or height < 30:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image dimensions too small. Minimum resolution is 30x30 pixels."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image file: {str(e)}"
        )
    
    # 4. Save file to uploads directory with unique filename
    ext = os.path.splitext(file.filename)[1].lower()
    if not ext:
        ext = ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(target_path, "wb") as f:
        f.write(contents)
    
    # 5. Extract genuine computer vision embedding
    try:
        embedding = extract_image_embedding(contents)
    except Exception as e:
        print(f"Warning: embedding extraction error: {e}")
        embedding = []

    file_url = f"/api/v1/uploads/files/{unique_filename}"

    return {
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_path": file_url,
        "file_size": file_size,
        "mime_type": file.content_type,
        "embedding": embedding,
        "width": width,
        "height": height
    }

def io_open(data: bytes):
    import io
    return io.BytesIO(data)
