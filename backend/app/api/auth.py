from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from backend.app.db.session import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponsePrivate,
    Token,
    UserChangePasswordRequest
)
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    validate_password_strength
)
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # 1. Check confirm password
    if req.password != req.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    
    # 2. Validate password strength
    validate_password_strength(req.password)
    
    # 3. Check unique registration number
    reg_clean = req.reg_number.strip().upper()
    existing_user = db.query(User).filter(User.reg_number == reg_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this university registration number is already registered. Please log in or contact Student Services."
        )
    
    # 4. Enforce conditional fields based on account type
    if req.account_type == "student":
        if not req.academic_year or not req.branch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Academic year and Branch are mandatory for Student accounts."
            )
    elif req.account_type == "staff":
        if not req.department or not req.designation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department and Designation are mandatory for Staff accounts."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account type must be either 'student' or 'staff'."
        )
    
    # 5. Create user with Argon2id hash
    hashed_pwd = get_password_hash(req.password)
    new_user = User(
        reg_number=reg_clean,
        full_name=req.full_name.strip(),
        account_type=req.account_type,
        mobile_number=req.mobile_number.strip(),
        password_hash=hashed_pwd,
        academic_year=req.academic_year.strip() if req.academic_year else None,
        branch=req.branch.strip() if req.branch else None,
        department=req.department.strip() if req.department else None,
        designation=req.designation.strip() if req.designation else None,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 6. Generate access token
    access_token = create_access_token(
        data={"sub": str(new_user.id), "reg": new_user.reg_number, "role": new_user.account_type}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "reg_number": new_user.reg_number,
            "full_name": new_user.full_name,
            "account_type": new_user.account_type,
            "mobile_number": new_user.mobile_number,
            "academic_year": new_user.academic_year,
            "branch": new_user.branch,
            "department": new_user.department,
            "designation": new_user.designation,
            "created_at": new_user.created_at.isoformat()
        }
    }

@router.post("/login", response_model=Token)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    reg_clean = req.reg_number.strip().upper()
    user = db.query(User).filter(User.reg_number == reg_clean).first()
    
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid registration number or password. Please verify your credentials or contact Student Services."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact LPU Student Services."
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id), "reg": user.reg_number, "role": user.account_type}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "reg_number": user.reg_number,
            "full_name": user.full_name,
            "account_type": user.account_type,
            "mobile_number": user.mobile_number,
            "academic_year": user.academic_year,
            "branch": user.branch,
            "department": user.department,
            "designation": user.designation,
            "created_at": user.created_at.isoformat()
        }
    }

@router.get("/me", response_model=UserResponsePrivate)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    req: UserChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
    if req.new_password != req.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match."
        )
    validate_password_strength(req.new_password)
    current_user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully."}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out."}
