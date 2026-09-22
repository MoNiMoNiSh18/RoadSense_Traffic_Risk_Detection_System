from app.ml.predictor import predict
from app.core.logger import logger
from app.db.database import SessionLocal
from app.db.crud import create_prediction
from app.db.models import User

from app.services.safety_recommendation import (
    generate_safety_message
)

from app.services.notification_service import (
    send_push_notification
)


def predict_risk(data, user_id):
    logger.info("Prediction request received")

    result = predict(data)

    logger.info(f"Prediction Result: {result}")

    db = SessionLocal()

    try:
        prediction_data = {
            **data,
            **result,
            "user_id": user_id
        }

        create_prediction(db, prediction_data)

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        risk = result.get("predicted_risk")

        safety_message = generate_safety_message(
            data,
            risk
        )

        if user and user.fcm_token:

            notification_result = send_push_notification(
                token=user.fcm_token,
                title=safety_message["title"],
                body=safety_message["body"]
            )

            if notification_result["success"]:
                logger.info(
                    "Safety notification sent successfully."
                )
            else:
                logger.warning(
                    "Safety notification could not be sent."
                )

        else:
            logger.info(
                "No FCM token registered for this user."
            )

        return result

    finally:
        db.close()