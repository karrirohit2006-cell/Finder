from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.session import get_db
from backend.app.models.models import CampusLocation
from backend.app.schemas.schemas import CampusLocationResponse

router = APIRouter(prefix="/locations", tags=["Campus Locations"])

@router.get("", response_model=List[CampusLocationResponse])
def get_locations(db: Session = Depends(get_db)):
    return db.query(CampusLocation).filter(CampusLocation.is_active == True).order_by(CampusLocation.category, CampusLocation.name).all()
