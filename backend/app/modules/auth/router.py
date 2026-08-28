from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from datetime import datetime

from app.database.session import get_session
from app.database.models import User, RevokedToken
from app.core.security import (
    verify_password, create_access_token, decode_token,
    oauth2_scheme, make_jti, hash_password,
)
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


class ChangePasswordBody(BaseModel):
    old_password: str
    new_password: str


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    payload = decode_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Token tidak valid")

    # Cek token blacklist
    exp_ts = payload.get("exp")
    if exp_ts:
        exp_dt = datetime.utcfromtimestamp(exp_ts)
        jti = make_jti(username, exp_dt)
        revoked = session.get(RevokedToken, jti)
        if revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token sudah tidak berlaku. Silakan login kembali.",
                headers={"WWW-Authenticate": "Bearer"},
            )

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
def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Logout: masukkan token ke blacklist agar tidak bisa dipakai lagi,
    meskipun belum expire secara waktu.
    """
    payload = decode_token(token)
    exp_ts = payload.get("exp")
    if exp_ts:
        exp_dt = datetime.utcfromtimestamp(exp_ts)
        jti = make_jti(current_user.username, exp_dt)

        # Simpan ke blacklist jika belum ada
        if not session.get(RevokedToken, jti):
            revoked = RevokedToken(jti=jti, expires_at=exp_dt)
            session.add(revoked)

            # Cleanup: hapus token blacklist yang sudah expired (housekeeping)
            now = datetime.utcnow()
            expired_tokens = session.exec(
                select(RevokedToken).where(RevokedToken.expires_at < now)
            ).all()
            for t in expired_tokens:
                session.delete(t)

            session.commit()

    log_action(
        action="LOGOUT",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="user",
        entity_id=current_user.id,
        description=f"Logout: {current_user.username} (token diblokir)",
    )
    return {"message": "Logout berhasil. Token sudah dinonaktifkan."}


@router.patch("/me/password")
def change_password(
    body: ChangePasswordBody,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Ganti password sendiri — verifikasi password lama sebelum set yang baru.
    Semua role bisa menggunakan endpoint ini.
    """
    if not verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Password lama tidak sesuai")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=422, detail="Password baru minimal 6 karakter")

    current_user.password_hash = hash_password(body.new_password)
    session.add(current_user)
    session.commit()

    log_action(
        action="CHANGE_PASSWORD",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="user",
        entity_id=current_user.id,
        description=f"Password diubah oleh: {current_user.username}",
    )
    return {"message": "Password berhasil diubah. Silakan login kembali."}


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    return MeResponse(
        id=current_user.id,
        nama=current_user.nama,
        username=current_user.username,
        role=current_user.role,
    )
