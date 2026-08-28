"""
Tests: Audit Log (F-006, F-016, NF-002)
Memastikan audit log tercatat dengan benar untuk aksi-aksi penting.
"""
import pytest
from fastapi.testclient import TestClient
from tests.conftest import auth_headers
from unittest.mock import patch, AsyncMock


class TestAuditLog:
    def test_login_creates_audit_log(self, client: TestClient, admin_user):
        """F-006: Login harus menciptakan audit log dengan action LOGIN."""
        client.post("/auth/login", data={"username": "admin_test", "password": "admin123"})

        res = client.post("/auth/login", data={"username": "admin_test", "password": "admin123"})
        assert res.status_code == 200

        token = res.json()["access_token"]
        audit_res = client.get("/audit-logs", headers=auth_headers(token))
        assert audit_res.status_code == 200
        logs = audit_res.json()
        login_logs = [l for l in logs if l["action"] == "LOGIN" and l["actor"] == "admin_test"]
        assert len(login_logs) >= 1

    def test_audit_log_has_required_fields(self, client: TestClient, admin_user):
        """F-016: Setiap audit log harus memiliki actor, action, created_at, description."""
        login_res = client.post("/auth/login", data={"username": "admin_test", "password": "admin123"})
        token = login_res.json()["access_token"]

        audit_res = client.get("/audit-logs", headers=auth_headers(token))
        assert audit_res.status_code == 200
        logs = audit_res.json()
        assert len(logs) > 0

        for log in logs:
            assert "actor" in log
            assert "action" in log
            assert "created_at" in log
            assert "description" in log

    def test_create_hearing_creates_audit_log(self, client: TestClient, panitera_token, panitera_user):
        """F-006: Membuat sidang harus menciptakan audit log CREATE_HEARING."""
        with patch(
            "app.modules.hearings.zoom_service.create_zoom_meeting",
            new_callable=AsyncMock,
            return_value={"id": 111, "join_url": "https://zoom.us/j/111", "start_url": "https://zoom.us/s/111", "password": "abc"},
        ):
            client.post(
                "/hearings",
                json={
                    "nomor_perkara": "AUDIT/TEST/2026",
                    "tanggal_sidang": "2026-09-20",
                    "jam_sidang": "10:00",
                    "jenis_sidang": "Pidana Biasa",
                    "status_transparansi": "open",
                    "status_sidang": "Terjadwal",
                },
                headers=auth_headers(panitera_token),
            )

        audit_res = client.get("/audit-logs", headers=auth_headers(panitera_token))
        logs = audit_res.json()
        create_logs = [l for l in logs if l["action"] == "CREATE_HEARING"]
        assert len(create_logs) >= 1

    def test_audit_log_unauthenticated(self, client: TestClient):
        """NF-004: Audit log tidak boleh diakses tanpa autentikasi."""
        res = client.get("/audit-logs")
        assert res.status_code == 401

    def test_audit_log_pagination(self, client: TestClient, admin_token):
        """F-016: Audit log harus mendukung pagination (limit/offset)."""
        res = client.get("/audit-logs?limit=5&offset=0", headers=auth_headers(admin_token))
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) <= 5
