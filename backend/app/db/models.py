from sqlalchemy import Column, Integer, Float, String, DateTime,Boolean, ForeignKey
from datetime import datetime

from app.db.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    traffic_density = Column(Integer)
    horn_events_per_min = Column(Float)
    avg_speed = Column(Float)
    signal_wait_time = Column(Float)

    weather_condition = Column(String)
    road_quality_score = Column(Float)
    driver_experience_level = Column(String)
    stress_index = Column(Float)

    predicted_risk = Column(String)
    confidence = Column(Float)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    email = Column(String, unique=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    is_active = Column(Boolean, default=True)

    fcm_token = Column(
    String,
    nullable=True
)