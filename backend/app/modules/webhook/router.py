import hashlib
import hmac
import json
from fastapi import APIRouter, Request, HTTPException, Header
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from app.core.config import settings
from app.database.session import engine
from app.database.models import WaitingParticipant, ZoomMeeting, Hearing
from app.utils.audit import log_action
from app.utils.name_validator import validate_participant_name

router = APIRouter()


def verify_zoom_signature(body: bytes, timestamp: str, signature: str) -> bool:
    """Verifikasi signature Zoom webhook (FR dari SCP005)."""
    if not settings.ZOOM_WEBHOOK_SECRET_TOKEN:
        return True  # Skip jika belum dikonfigurasi (dev mode)
    msg = f"v0:{timestamp}:{body.decode()}"
    expected = "v0=" + hmac.new(
        settings.ZOOM_WEBHOOK_SECRET_TOKEN.encode(),
        msg.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature or "")


@router.post("/zoom")
async def zoom_webhook(
    request: Request,
    x_zm_signature: Optional[str] = Header(default=None),
    x_zm_request_timestamp: Optional[str] = Header(default=None),
):
    body = await request.body()

    # Verifikasi signature (NFR — keamanan)
    if x_zm_signature and x_zm_request_timestamp:
        if not verify_zoom_signature(body, x_zm_request_timestamp, x_zm_signature):
            raise HTTPException(status_code=401, detail="Signature webhook tidak valid")

    try:
        payload = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Payload tidak valid")

    event = payload.get("event", "")

    # Handle Zoom URL validation challenge
    if event == "endpoint.url_validation":
        plain_token = payload.get("payload", {}).get("plainToken", "")
        encrypted = hmac.new(
            settings.ZOOM_WEBHOOK_SECRET_TOKEN.encode(),
            plain_token.encode(),
            hashlib.sha256,
        ).hexdigest()
        return {"plainToken": plain_token, "encryptedToken": encrypted}

    # Handle waiting room join event
    if event in ("meeting.participant_waiting", "meeting.participant_joined_waiting_room"):
        _handle_participant_waiting(payload)

    return {"status": "ok"}


def _handle_participant_waiting(payload: dict):
    """Proses peserta yang masuk waiting room."""
    try:
        meeting_obj = payload.get("payload", {}).get("object", {})
        meeting_id = str(meeting_obj.get("id", ""))
        participant = meeting_obj.get("participant", {})
        display_name = participant.get("user_name", "")
        source_event_id = participant.get("participant_uuid", "")

        if not display_name or not meeting_id:
            return

        with Session(engine) as session:
            # Cari hearing berdasarkan zoom_meeting_id
            zm = session.exec(
                select(ZoomMeeting).where(ZoomMeeting.zoom_meeting_id == meeting_id)
            ).first()

            if not zm:
                log_action(
                    action="WEBHOOK_UNKNOWN_MEETING",
                    entity_type="zoom_meeting",
                    entity_id=meeting_id,
                    description=f"Webhook diterima untuk meeting tidak dikenal: {meeting_id}",
                )
                return

            validation_status = validate_participant_name(display_name)

            # Cek duplikat (berdasarkan source_event_id)
            if source_event_id:
                existing = session.exec(
                    select(WaitingParticipant).where(
                        WaitingParticipant.source_event_id == source_event_id,
                        WaitingParticipant.hearing_id == zm.hearing_id,
                    )
                ).first()
                if existing:
                    return

            participant_record = WaitingParticipant(
                hearing_id=zm.hearing_id,
                display_name=display_name,
                validation_status=validation_status,
                source_event_id=source_event_id or None,
            )
            session.add(participant_record)
            session.commit()
            session.refresh(participant_record)

            log_action(
                action="WEBHOOK_PARTICIPANT_JOINED",
                entity_type="participant",
                entity_id=participant_record.id,
                description=f"Peserta '{display_name}' masuk waiting room ({validation_status})",
            )
    except Exception as e:
        log_action(
            action="WEBHOOK_PROCESSING_ERROR",
            entity_type="webhook",
            entity_id="",
            description=f"Error memproses webhook: {str(e)}",
        )
