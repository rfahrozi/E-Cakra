import httpx
from app.core.config import settings


ZOOM_TOKEN_URL = "https://zoom.us/oauth/token"
ZOOM_API_BASE  = "https://api.zoom.us/v2"


async def get_zoom_access_token() -> str:
    """Ambil access token Zoom via Server-to-Server OAuth."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                ZOOM_TOKEN_URL,
                params={"grant_type": "account_credentials", "account_id": settings.ZOOM_ACCOUNT_ID},
                auth=(settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET),
                timeout=10,
            )
            resp.raise_for_status()
            return resp.json()["access_token"]
    except httpx.HTTPStatusError as e:
        raise RuntimeError(f"Gagal mendapatkan token Zoom: HTTP {e.response.status_code}")
    except httpx.RequestError as e:
        raise RuntimeError(f"Gagal terhubung ke Zoom: {str(e)}")


async def create_zoom_meeting(topic: str, start_time: str, duration: int = 120) -> dict:
    """
    Buat Zoom meeting dengan konfigurasi standar E-CAKRA.
    FR007: waiting_room aktif, mute_upon_entry aktif.
    """
    token = await get_zoom_access_token()
    payload = {
        "topic": topic,
        "type": 2,  # Scheduled meeting
        "start_time": start_time,
        "duration": duration,
        "timezone": "Asia/Jakarta",
        "settings": {
            "waiting_room": True,
            "mute_upon_entry": True,
            "join_before_host": False,
            "approval_type": 2,
            "audio": "voip",
            "auto_recording": "none",
            "use_pmi": False,
        },
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{ZOOM_API_BASE}/users/{settings.ZOOM_HOST_USER_ID}/meetings",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=payload,
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        raise RuntimeError(f"Gagal membuat Zoom Meeting: HTTP {e.response.status_code} - {e.response.text}")
    except httpx.RequestError as e:
        raise RuntimeError(f"Gagal terhubung ke API Zoom: {str(e)}")

async def control_zoom_participant(meeting_id: str, participant_uuid: str, action: str) -> bool:
    """
    Kirim perintah ke Zoom API untuk kontrol participant (admit / deny).
    action bisa berupa: 'admit' atau 'deny'
    """
    if not participant_uuid:
        raise RuntimeError("participant_uuid Zoom tidak tersedia")

    token = await get_zoom_access_token()
    payload = {
        "action": action,
        "participants": [{"participant_uuid": participant_uuid}]
    }

    # Zoom endpoint untuk mengubah status peserta di waiting room
    # PUT /meetings/{meetingId}/participants/events
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.put(
                f"{ZOOM_API_BASE}/meetings/{meeting_id}/participants/events",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=payload,
                timeout=10,
            )
            if resp.status_code == 204:
                return True
            raise RuntimeError(f"Zoom participant control gagal: HTTP {resp.status_code} - {resp.text}")
    except httpx.RequestError as e:
        raise RuntimeError(f"Gagal terhubung ke Zoom saat kontrol participant: {str(e)}")
