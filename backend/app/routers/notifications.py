from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User


router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["Notifications"]
)


@router.post("/register")
def register_notification_token(
    token_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    token = token_data.get("token")

    if not token:
        return {
            "success": False,
            "message": "FCM token is required."
        }

    current_user.fcm_token = token

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Notification device registered successfully."
    }