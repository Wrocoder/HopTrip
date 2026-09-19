from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, catalog, health
from app.config import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)
app.include_router(health.router)
app.include_router(catalog.router)
app.include_router(admin.router)

