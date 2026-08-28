from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel, Field

from app.database.session import get_session
from app.database.models import User, UserRole
from app.modules.auth.router import get_current_user
from app.core.security import hash_password
from app.utils.audit import log_action

router = APIRouter()

# ── Schemas ────────────────────────────────────────────────

class UserCreate(BaseModel):
    nama: str = Field(..., max_length=150)
    username: str = Field(..., max_length=80)
    password: str = Field(..., min_length=6)
    role: UserRole
    is_active: bool = True

class UserUpdate(BaseModel):
    nama: Optional[str] = Field(None, max_length=150)
    username: Optional[str] = Field(None, max_length=80)
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserOut(BaseModel):
    id: str
    nama: str
    username: str
    role: UserRole
    is_active: bool

# ── Dependencies ──────────────────────────────────────────

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Akses ditolak. Memerlukan role admin.")
    return current_user

# ── Endpoints ─────────────────────────────────────────────

@router.get("", response_model=List[UserOut])
def list_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Ambil daftar semua user (hanya admin)."""
    users = session.exec(select(User).order_by(User.nama)).all()
    return users

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    body: UserCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Buat user baru (hanya admin)."""
    # Cek username
    existing = session.exec(select(User).where(User.username == body.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username sudah digunakan")

    user = User(
        nama=body.nama,
        username=body.username,
        password_hash=hash_password(body.password),
        role=body.role,
        is_active=body.is_active,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    log_action(
        action="CREATE_USER",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="user",
        entity_id=user.id,
        description=f"User baru dibuat: {user.username} ({user.role.value})",
    )
    return user

@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    body: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Update data user (hanya admin)."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if body.username and body.username != user.username:
        existing = session.exec(select(User).where(User.username == body.username)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username sudah digunakan")
        user.username = body.username

    if body.nama is not None:
        user.nama = body.nama
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.password:
        user.password_hash = hash_password(body.password)

    session.add(user)
    session.commit()
    session.refresh(user)

    log_action(
        action="UPDATE_USER",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="user",
        entity_id=user.id,
        description=f"User diperbarui: {user.username}",
    )
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    """Hapus user (hanya admin)."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Tidak dapat menghapus diri sendiri")

    # Hard delete untuk MVP (soft delete lebih baik untuk production)
    session.delete(user)
    session.commit()

    log_action(
        action="DELETE_USER",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="user",
        entity_id=user_id,
        description=f"User dihapus: {user.username}",
    )
    return None
