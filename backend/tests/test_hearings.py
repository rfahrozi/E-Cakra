"""
Tests: Modul Hearings (F-002, F-010, F-011, F-012, F-013)
- CRUD sidang
- Kontrol akses berdasarkan role
- Update sidang (F-012)
"""
import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from tests.conftest import auth_headers


HEARING_PAYLOAD = {
    "nomor_perkara": "123/Pid.B/2026/PT.TST",
    "tanggal_sidang": "2026-09-15",
    "jam_sidang": "09:00",
    "jenis_sidang": "Pidana Biasa",
    "status_transparansi": "open",
    "terdakwa": "Budi Santoso",
    "pengadilan_pengirim": "PN Jakarta Pusat",
    "kejaksaan_negeri": "Kejari Jakarta Pusat",
    "lapas_rutan": "Rutan Salemba",
    "agenda": "Pembacaan Dakwaan",
    "status_sidang": "Terjadwal",
}

# Mock Zoom agar test tidak perlu koneksi internet
ZOOM_MOCK_RESPONSE = {
    "id": 99999999999,
    "join_url": "https://zoom.us/j/99999999999?pwd=test",
    "start_url": "https://zoom.us/s/99999999999?zak=test",
    "password": "testpwd",
}


@pytest.fixture(name="mock_zoom")
def mock_zoom_fixture():
    """Mock Zoom API — semua test hearing memakai ini agar tidak hit Zoom."""
    with patch(
        "app.modules.hearings.zoom_service.create_zoom_meeting",
        new_callable=AsyncMock,
        return_value=ZOOM_MOCK_RESPONSE,
    ) as mock:
        yield mock


@pytest.fixture(name="mock_zoom_update")
def mock_zoom_update_fixture():
    with patch(
        "app.modules.hearings.zoom_service.update_zoom_meeting",
        new_callable=AsyncMock,
        return_value=True,
    ) as mock:
        yield mock


class TestCreateHearing:
    def test_panitera_can_create(self, client: TestClient, panitera_token, mock_zoom):
        """F-002: Panitera harus bisa membuat sidang."""
        res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        assert res.status_code == 201
        data = res.json()
        assert data["nomor_perkara"] == HEARING_PAYLOAD["nomor_perkara"]
        assert data["status_sidang"] == "Terjadwal"

    def test_admin_can_create(self, client: TestClient, admin_token, mock_zoom):
        """F-002: Admin harus bisa membuat sidang."""
        payload = {**HEARING_PAYLOAD, "nomor_perkara": "456/Pid.B/2026/PT.TST"}
        res = client.post("/hearings", json=payload, headers=auth_headers(admin_token))
        assert res.status_code == 201

    def test_operator_cannot_create(self, client: TestClient, operator_token, mock_zoom):
        """F-002: Operator tidak boleh membuat sidang (hanya Admin/Panitera)."""
        res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(operator_token))
        assert res.status_code == 403

    def test_unauthenticated_cannot_create(self, client: TestClient):
        """NF-004: Tanpa token tidak bisa membuat sidang."""
        res = client.post("/hearings", json=HEARING_PAYLOAD)
        assert res.status_code == 401

    def test_empty_nomor_perkara_rejected(self, client: TestClient, panitera_token, mock_zoom):
        """F-002: Nomor perkara kosong harus ditolak."""
        payload = {**HEARING_PAYLOAD, "nomor_perkara": "   "}
        res = client.post("/hearings", json=payload, headers=auth_headers(panitera_token))
        assert res.status_code == 422

    def test_zoom_failure_does_not_lose_hearing(self, client: TestClient, panitera_token):
        """NF-006: Jika Zoom gagal, sidang tetap tersimpan di DB."""
        with patch(
            "app.modules.hearings.zoom_service.create_zoom_meeting",
            new_callable=AsyncMock,
            side_effect=RuntimeError("Zoom tidak tersedia"),
        ):
            payload = {**HEARING_PAYLOAD, "nomor_perkara": "789/Pid.B/2026/PT.TST"}
            res = client.post("/hearings", json=payload, headers=auth_headers(panitera_token))
            assert res.status_code == 201
            data = res.json()
            assert data["zoom_status"] == "failed"
            assert data["zoom_meeting"] is None
            # Sidang tetap tersimpan dengan nomor perkara benar
            assert data["nomor_perkara"] == "789/Pid.B/2026/PT.TST"


class TestListAndGetHearing:
    def test_list_hearings(self, client: TestClient, operator_token, mock_zoom, panitera_token):
        """F-010: List sidang harus bisa diakses semua role yang login."""
        # Buat sidang dulu
        client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        res = client.get("/hearings", headers=auth_headers(operator_token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_get_hearing_detail(self, client: TestClient, panitera_token, mock_zoom):
        """F-011: Detail sidang harus memuat semua field."""
        create_res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        hearing_id = create_res.json()["id"]

        res = client.get(f"/hearings/{hearing_id}", headers=auth_headers(panitera_token))
        assert res.status_code == 200
        data = res.json()
        assert data["terdakwa"] == "Budi Santoso"
        assert data["agenda"] == "Pembacaan Dakwaan"

    def test_get_nonexistent_hearing(self, client: TestClient, operator_token):
        """F-011: Hearing ID yang tidak ada harus 404."""
        res = client.get("/hearings/id-tidak-ada-sama-sekali", headers=auth_headers(operator_token))
        assert res.status_code == 404


class TestUpdateHearing:
    def test_panitera_can_update(self, client: TestClient, panitera_token, mock_zoom, mock_zoom_update):
        """F-012: Panitera harus bisa mengupdate sidang."""
        create_res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        hearing_id = create_res.json()["id"]

        res = client.patch(
            f"/hearings/{hearing_id}",
            json={"agenda": "Agenda Diubah", "status_sidang": "Selesai"},
            headers=auth_headers(panitera_token),
        )
        assert res.status_code == 200
        assert res.json()["agenda"] == "Agenda Diubah"
        assert res.json()["status_sidang"] == "Selesai"

    def test_operator_cannot_update(self, client: TestClient, panitera_token, operator_token, mock_zoom):
        """F-012: Operator tidak boleh mengupdate sidang."""
        create_res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        hearing_id = create_res.json()["id"]

        res = client.patch(
            f"/hearings/{hearing_id}",
            json={"agenda": "Diubah oleh operator"},
            headers=auth_headers(operator_token),
        )
        assert res.status_code == 403

    def test_update_nonexistent_hearing(self, client: TestClient, admin_token):
        """F-012: Update hearing yang tidak ada harus 404."""
        res = client.patch(
            "/hearings/id-palsu",
            json={"agenda": "Test"},
            headers=auth_headers(admin_token),
        )
        assert res.status_code == 404

    def test_zoom_sync_called_on_schedule_change(
        self, client: TestClient, panitera_token, mock_zoom, mock_zoom_update
    ):
        """F-012: Sinkronisasi Zoom dipanggil saat tanggal/jam berubah."""
        create_res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        hearing_id = create_res.json()["id"]

        res = client.patch(
            f"/hearings/{hearing_id}",
            json={"tanggal_sidang": "2026-10-01", "jam_sidang": "13:00"},
            headers=auth_headers(panitera_token),
        )
        assert res.status_code == 200
        assert mock_zoom_update.called


class TestDeleteHearing:
    def test_panitera_can_delete(self, client: TestClient, panitera_token, mock_zoom):
        """F-013: Panitera harus bisa menghapus sidang."""
        create_res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        hearing_id = create_res.json()["id"]

        res = client.delete(f"/hearings/{hearing_id}", headers=auth_headers(panitera_token))
        assert res.status_code == 204

        # Pastikan sudah tidak ada
        get_res = client.get(f"/hearings/{hearing_id}", headers=auth_headers(panitera_token))
        assert get_res.status_code == 404

    def test_operator_cannot_delete(self, client: TestClient, panitera_token, operator_token, mock_zoom):
        """F-013: Operator tidak boleh menghapus sidang."""
        create_res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        hearing_id = create_res.json()["id"]

        res = client.delete(f"/hearings/{hearing_id}", headers=auth_headers(operator_token))
        assert res.status_code == 403


class TestHearingTemplate:
    def test_template_generated(self, client: TestClient, panitera_token, mock_zoom):
        """F-007: Template distribusi harus mengandung info perkara dan Zoom."""
        create_res = client.post("/hearings", json=HEARING_PAYLOAD, headers=auth_headers(panitera_token))
        hearing_id = create_res.json()["id"]

        res = client.get(f"/hearings/{hearing_id}/template", headers=auth_headers(panitera_token))
        assert res.status_code == 200
        data = res.json()
        assert "123/Pid.B/2026/PT.TST" in data["teks_siap_salin"]
        assert "FORMAT NAMA" in data["teks_siap_salin"]
        assert data["nomor_perkara"] == "123/Pid.B/2026/PT.TST"
