import httpx
from app.core.config import settings


ZOOM_TOKEN_URL = "https://zoom.us/oauth/token"
ZOOM_API_BASE  = "https://api.zoom.us/v2"


async def get_zoom_access_token() -> str:
    """Ambil access token Zoom via Server-to-Server OAuth."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            ZOOM_TOKEN_URL,
            params={"grant_type": "account_credentials", "account_id": settings.ZOOM_ACCOUNT_ID},
            auth=(settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


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
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ZOOM_API_BASE}/users/{settings.ZOOM_HOST_USER_ID}/meetings",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()

async def control_zoom_participant(meeting_id: str, participant_uuid: str, action: str) -> bool:
    """
    Kirim perintah ke Zoom API untuk kontrol participant (admit / deny).
    action bisa berupa: 'admit' atau 'deny'
    """
    if not participant_uuid:
        return False

    token = await get_zoom_access_token()
    payload = {
        "action": action,
        "participants": [{"participant_uuid": participant_uuid}]
    }

    # Zoom endpoint untuk mengubah status peserta di waiting room
    # PUT /meetings/{meetingId}/participants/events
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{ZOOM_API_BASE}/meetings/{meeting_id}/participants/events",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json=payload,
            timeout=10,
        )
        if resp.status_code == 204:
            return True
        else:
            print(f"Zoom API Error: {resp.status_code} - {resp.text}")
            return False
