from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel

from app.database.session import get_session
from app.database.models import User
from app.core.security import verify_password, create_access_token, decode_token, oauth2_scheme
from app.utils.audit import log_action

router = APIRouter()


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class MeResponse(BaseModel):
    id: str
    nama: str
    username: str
    role: str


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    payload = decode_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    user = session.exec(select(User).where(User.username == username)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User tidak ditemukan atau tidak aktif")
    return user


@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Akun tidak aktif")

    token = create_access_token({"sub": user.username, "role": user.role})
    log_action(
        action="LOGIN",
        actor=user.username,
        actor_user_id=user.id,
        entity_type="user",
        entity_id=user.id,
        description=f"Login berhasil: {user.username}",
    )
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user={"id": user.id, "nama": user.nama, "username": user.username, "role": user.role},
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    log_action(
        action="LOGOUT",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="user",
        entity_id=current_user.id,
        description=f"Logout: {current_user.username}",
    )
    return {"message": "Logout berhasil, harap hapus token di client"}


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    return MeResponse(
        id=current_user.id,
        nama=current_user.nama,
        username=current_user.username,
        role=current_user.role,
    )
