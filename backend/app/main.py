from fastapi import FastAPI
from app.api.routes.history import router as history_router
from app.db.database import engine
from app.db.models import Base
from app.api.routes.prediction import router as prediction_router
from app.core.exception_handler import register_exception_handlers
from app.api.routes.health import router as health_router
from app.auth.routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.traffic import router as traffic_router
from app.routers.notifications import router as notifications_router

app = FastAPI(
    title="Traffic Risk Detection System API",
    version="1.0.0",
    description="AI-powered Traffic Risk Detection System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(history_router)
app.include_router(health_router)
app.include_router(prediction_router)
app.include_router(traffic_router)
app.include_router(notifications_router)