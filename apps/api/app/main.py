import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, affiliate, analytics, catalog, health
from app.config import get_settings
from app.security import SecurityMiddleware

settings = get_settings()
logging.basicConfig(level=settings.log_level)
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(SecurityMiddleware, rate_limit=settings.public_rate_limit)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)
app.include_router(health.router)
app.include_router(catalog.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(affiliate.router)
