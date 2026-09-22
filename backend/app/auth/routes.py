from fastapi import APIRouter, HTTPException, Depends
from app.auth.service import hash_password
from app.db.database import SessionLocal,get_db
from app.auth.schemas import UserRegister, UserResponse, UserLogin, TokenResponse,NotificationTokenRequest
from app.auth.security import verify_password, create_access_token
from app.db.crud import create_user, get_user_by_email
from fastapi.security import OAuth2PasswordRequestForm
from app.auth.dependencies import get_current_user
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse)
def register(user: UserRegister):
    db = SessionLocal()

    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user_data = user.model_dump()

    user_data["hashed_password"] = hash_password(user_data.pop("password"))

    new_user = create_user(db, user_data)

    db.close()

    return new_user

@router.post("/notifications/register")
def register_notification_token(
    data: NotificationTokenRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.fcm_token = data.token

    db.commit()

    return {
        "message": "Notification device registered successfully"
    }

@router.post("/login", response_model=TokenResponse)
def login(
    user: OAuth2PasswordRequestForm = Depends()
):
    db = SessionLocal()

    existing_user = get_user_by_email(db, user.username)

    if not existing_user:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.hashed_password
    ):
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {"sub": str(existing_user.id)}
    )

    db.close()

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

