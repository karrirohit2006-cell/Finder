import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.db.init_db import init_db
from backend.app.api.auth import router as auth_router
from backend.app.api.lost_reports import router as lost_router
from backend.app.api.found_reports import router as found_router
from backend.app.api.recovery import router as recovery_router
from backend.app.api.messages import router as messages_router
from backend.app.api.notifications import router as notifications_router
from backend.app.api.feedback import router as feedback_router
from backend.app.api.users import router as users_router
from backend.app.api.locations import router as locations_router
from backend.app.api.image_search import router as image_search_router
from backend.app.api.uploads import router as uploads_router
from backend.app.api.safety import router as safety_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed locations
    init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Back2You — Independent Lost & Found Portal for Lovely Professional University (LPU)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded item photographs securely
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/api/v1/uploads/files", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(lost_router, prefix=api_v1)
app.include_router(found_router, prefix=api_v1)
app.include_router(recovery_router, prefix=api_v1)
app.include_router(messages_router, prefix=api_v1)
app.include_router(notifications_router, prefix=api_v1)
app.include_router(feedback_router, prefix=api_v1)
app.include_router(users_router, prefix=api_v1)
app.include_router(locations_router, prefix=api_v1)
app.include_router(image_search_router, prefix=api_v1)
app.include_router(uploads_router, prefix=api_v1)
app.include_router(safety_router, prefix=api_v1)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE
    }

@app.get("/api/v1/student-services")
def get_student_services_info():
    return {
        "room": settings.STUDENT_SERVICES_ROOM,
        "email": settings.STUDENT_SERVICES_EMAIL,
        "phone": settings.STUDENT_SERVICES_PHONE,
        "hours": settings.STUDENT_SERVICES_HOURS,
        "disclaimer": "Back2You is an independent community portal for the LPU campus. If you need in-person recovery or official verification, please visit the Student Services Division."
    }

# Serve React SPA production build if present
from fastapi.responses import FileResponse
from fastapi import HTTPException

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API route not found")
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index not found")

