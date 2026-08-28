from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database.session import create_db_and_tables
from app.modules.auth.router import router as auth_router
from app.modules.hearings.router import router as hearings_router
from app.modules.waiting_room.router import router as waiting_room_router
from app.modules.audit.router import router as audit_router
from app.modules.webhook.router import router as webhook_router
from app.modules.dashboard.router import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Electronic Command & Access for Court Room Administration",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(hearings_router, prefix="/hearings", tags=["Hearings"])
app.include_router(waiting_room_router, prefix="/participants", tags=["Waiting Room"])
app.include_router(audit_router, prefix="/audit-logs", tags=["Audit Log"])
app.include_router(webhook_router, prefix="/webhooks", tags=["Webhook"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
