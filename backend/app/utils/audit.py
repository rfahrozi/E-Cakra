from sqlmodel import Session
from app.database.models import AuditLog
from app.database.session import engine
from typing import Optional


def log_action(
    action: str,
    actor: str = "system",
    actor_user_id: Optional[str] = None,
    entity_type: str = "",
    entity_id: str = "",
    description: str = "",
):
    """Catat audit log ke database."""
    with Session(engine) as session:
        log = AuditLog(
            actor=actor,
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
        )
        session.add(log)
        session.commit()
