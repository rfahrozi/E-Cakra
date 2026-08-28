from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime

from app.database.session import get_session
from app.database.models import AuditLog
from app.modules.auth.router import get_current_user, User

router = APIRouter()


@router.get("")
def list_audit_logs(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0),
    action: Optional[str] = Query(default=None),
):
    query = select(AuditLog).order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    if action:
        query = select(AuditLog).where(AuditLog.action == action).order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)

    logs = session.exec(query).all()
    return [
        {
            "id": log.id,
            "actor": log.actor,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "description": log.description,
            "created_at": log.created_at,
        }
        for log in logs
    ]
