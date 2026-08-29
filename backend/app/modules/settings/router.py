from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database.session import get_session
from app.database.models import SystemSettings, UserRole
from app.modules.auth.router import get_current_user, User
from app.utils.audit import log_action

router = APIRouter()

# ── Schemas ────────────────────────────────────────────────

class SettingUpdate(BaseModel):
    value: str

class SettingOut(BaseModel):
    key: str
    value: str
    description: Optional[str]
    updated_at: datetime

# ── Dependencies ──────────────────────────────────────────

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Akses ditolak. Memerlukan role admin.")
    return current_user

# ── Endpoints ─────────────────────────────────────────────

@router.get("", response_model=List[SettingOut])
def list_settings(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Ambil semua konfigurasi (hanya admin)."""
    settings = session.exec(select(SystemSettings).order_by(SystemSettings.key)).all()
    return settings

@router.get("/general", response_model=dict)
def get_general_settings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Ambil konfigurasi umum (seperti list instansi) yang boleh dibaca oleh semua role.
    Hanya mengembalikan key yang terdaftar di whitelist.
    """
    allowed_keys = [
        "list_pengadilan_negeri",
        "list_kejaksaan_negeri",
        "list_rutan",
        "list_hakim",
        "list_panitera",
    ]

    result = {}
    for key in allowed_keys:
        setting = session.get(SystemSettings, key)
        result[key] = setting.value if setting else ""

    return result

@router.patch("/{key}", response_model=SettingOut)
def update_setting(
    key: str,
    body: SettingUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Update atau buat konfigurasi (hanya admin)."""
    setting = session.get(SystemSettings, key)
    if not setting:
        setting = SystemSettings(key=key)

    setting.value = body.value
    setting.updated_at = datetime.utcnow()

    session.add(setting)
    session.commit()
    session.refresh(setting)

    log_action(
        action="UPDATE_SETTING",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="system_settings",
        entity_id=key,
        description=f"Konfigurasi diperbarui: {key}",
    )
    return setting
