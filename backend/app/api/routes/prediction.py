from app.services.prediction_service import predict_risk as predict_service
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.db.crud import get_predictions
from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.services.safety_recommendation import (
    generate_safety_message
)

from app.services.notification_service import (
    send_push_notification
)

router = APIRouter(
    prefix="/api/v1",
    tags=["Prediction"]
)


@router.post("/predict", response_model=PredictionResponse)
def predict(
    data: PredictionRequest,
    current_user=Depends(get_current_user)
):
    return predict_service(
        data.model_dump(),
        current_user.id
    )


@router.get("/risk-map")
def get_risk_map(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    predictions = get_predictions(db)

    located_predictions = [
        prediction
        for prediction in predictions
        if prediction.latitude is not None
        and prediction.longitude is not None
        and prediction.user_id == current_user.id
    ]

    return [
        {
            "id": prediction.id,
            "latitude": prediction.latitude,
            "longitude": prediction.longitude,
            "predicted_risk": prediction.predicted_risk,
            "confidence": prediction.confidence,
            "traffic_density": prediction.traffic_density,
            "avg_speed": prediction.avg_speed,
            "weather_condition": prediction.weather_condition,
            "road_quality_score": prediction.road_quality_score,
            "stress_index": prediction.stress_index,
            "created_at": prediction.created_at,
        }
        for prediction in located_predictions
    ]

@router.get("/regional-risk")
def get_regional_risk(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    predictions = get_predictions(db)

    located_predictions = [
        prediction
        for prediction in predictions
        if prediction.latitude is not None
        and prediction.longitude is not None
        and prediction.user_id == current_user.id
    ]

    if not located_predictions:
        return {
            "total_predictions": 0,
            "high_risk": 0,
            "medium_risk": 0,
            "low_risk": 0,
            "regional_risk": "No Data",
            "center": None
        }

    high_risk = sum(
        1 for prediction in located_predictions
        if prediction.predicted_risk == "High"
    )

    medium_risk = sum(
        1 for prediction in located_predictions
        if prediction.predicted_risk == "Medium"
    )

    low_risk = sum(
        1 for prediction in located_predictions
        if prediction.predicted_risk == "Low"
    )

    total_predictions = len(located_predictions)

    risk_score = (
        (high_risk * 3)
        + (medium_risk * 2)
        + (low_risk * 1)
    ) / total_predictions

    if risk_score >= 2.5:
        regional_risk = "High"
    elif risk_score >= 1.5:
        regional_risk = "Medium"
    else:
        regional_risk = "Low"

    center_latitude = sum(
        prediction.latitude
        for prediction in located_predictions
    ) / total_predictions

    center_longitude = sum(
        prediction.longitude
        for prediction in located_predictions
    ) / total_predictions

    return {
        "total_predictions": total_predictions,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "regional_risk": regional_risk,
        "center": {
            "latitude": center_latitude,
            "longitude": center_longitude
        }
    }