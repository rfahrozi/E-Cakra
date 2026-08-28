"""
Tests: Modul Autentikasi (F-001, NF-004)
- Login valid/invalid
- Token blacklist saat logout
- Akses endpoint terproteksi
"""
import pytest
from fastapi.testclient import TestClient
from tests.conftest import auth_headers


class TestLogin:
    def test_login_valid(self, client: TestClient, admin_user):
        """F-001: Login dengan kredensial valid harus mengembalikan JWT token."""
        res = client.post("/auth/login", data={
            "username": "admin_test",
            "password": "admin123",
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "admin_test"
        assert data["user"]["role"] == "admin"

    def test_login_wrong_password(self, client: TestClient, admin_user):
        """F-001: Password salah harus mengembalikan 401."""
        res = client.post("/auth/login", data={
            "username": "admin_test",
            "password": "salah_banget",
        })
        assert res.status_code == 401
        assert "salah" in res.json()["detail"].lower()

    def test_login_wrong_username(self, client: TestClient):
        """F-001: Username tidak ada harus mengembalikan 401."""
        res = client.post("/auth/login", data={
            "username": "tidak_ada",
            "password": "apapun",
        })
        assert res.status_code == 401

    def test_login_inactive_user(self, client: TestClient, session):
        """F-001: User tidak aktif harus diblokir."""
        from app.database.models import User, UserRole
        from app.core.security import hash_password
        inactive = User(
            nama="Inactive",
            username="inactive_test",
            password_hash=hash_password("pass123"),
            role=UserRole.operator,
            is_active=False,
        )
        session.add(inactive)
        session.commit()

        res = client.post("/auth/login", data={
            "username": "inactive_test",
            "password": "pass123",
        })
        assert res.status_code == 403

        session.delete(inactive)
        session.commit()


class TestLogoutAndBlacklist:
    def test_logout_success(self, client: TestClient, admin_token):
        """Logout harus berhasil dan mengembalikan pesan sukses."""
        res = client.post("/auth/logout", headers=auth_headers(admin_token))
        assert res.status_code == 200
        assert "nonaktifkan" in res.json()["message"].lower() or "berhasil" in res.json()["message"].lower()

    def test_token_blacklisted_after_logout(self, client: TestClient, panitera_user):
        """Token blacklist: token yang sudah logout tidak boleh bisa akses endpoint."""
        from app.core.security import create_access_token
        token = create_access_token({"sub": panitera_user.username, "role": panitera_user.role})
        headers = auth_headers(token)

        # Pastikan token masih valid sebelum logout
        res_before = client.get("/auth/me", headers=headers)
        assert res_before.status_code == 200

        # Logout
        res_logout = client.post("/auth/logout", headers=headers)
        assert res_logout.status_code == 200

        # Token yang sama tidak boleh bisa dipakai lagi
        res_after = client.get("/auth/me", headers=headers)
        assert res_after.status_code == 401

    def test_me_without_token(self, client: TestClient):
        """NF-004: Endpoint terproteksi tanpa token harus mengembalikan 401."""
        res = client.get("/auth/me")
        assert res.status_code == 401

    def test_me_with_invalid_token(self, client: TestClient):
        """NF-004: Token tidak valid harus ditolak."""
        res = client.get("/auth/me", headers={"Authorization": "Bearer token_palsu_bukan_jwt"})
        assert res.status_code == 401

    def test_me_returns_correct_user(self, client: TestClient, operator_token, operator_user):
        """GET /auth/me harus mengembalikan data user yang sedang login."""
        res = client.get("/auth/me", headers=auth_headers(operator_token))
        assert res.status_code == 200
        data = res.json()
        assert data["username"] == "operator_test"
        assert data["role"] == "operator"
