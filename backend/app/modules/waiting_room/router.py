from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from app.database.session import get_session
from app.database.models import WaitingParticipant, OperatorDecision, ZoomMeeting, UserRole
from app.modules.auth.router import get_current_user, User
from app.modules.hearings.zoom_service import control_zoom_participant
from app.utils.audit import log_action

router = APIRouter()


async def _decide(
    participant_id: str,
    decision: OperatorDecision,
    session: Session,
    current_user: User,
):
    if current_user.role not in [UserRole.admin, UserRole.operator]:
        raise HTTPException(status_code=403, detail="Hanya Admin atau Operator yang dapat mengelola peserta")

    participant = session.get(WaitingParticipant, participant_id)
    if not participant:
        raise HTTPException(status_code=404, detail="Peserta tidak ditemukan")

    # Ambil data meeting untuk integrasi Zoom API
    zm = session.exec(select(ZoomMeeting).where(ZoomMeeting.hearing_id == participant.hearing_id)).first()

    # Kirim perintah ke Zoom API jika source_event_id dan zoom_meeting_id tersedia
    # 'admit' dikirim 'admit', 'reject' dikirim 'deny'.
    # Untuk 'hold', tidak ada endpoint API Zoom khusus untuk mengubah status tanpa action admit/deny,
    # jadi kita ubah saja secara lokal.
    if zm and participant.source_event_id:
        if decision == OperatorDecision.admit:
            await control_zoom_participant(zm.zoom_meeting_id, participant.source_event_id, "admit")
        elif decision == OperatorDecision.reject:
            await control_zoom_participant(zm.zoom_meeting_id, participant.source_event_id, "deny")

    participant.operator_decision = decision
    participant.updated_at = datetime.utcnow()
    session.add(participant)
    session.commit()
    session.refresh(participant)

    action_map = {
        OperatorDecision.admit:  "ADMIT_PARTICIPANT",
        OperatorDecision.hold:   "HOLD_PARTICIPANT",
        OperatorDecision.reject: "REJECT_PARTICIPANT",
    }
    label_map = {
        OperatorDecision.admit:  "diizinkan masuk",
        OperatorDecision.hold:   "ditahan",
        OperatorDecision.reject: "ditolak",
    }

    log_action(
        action=action_map[decision],
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="participant",
        entity_id=participant.id,
        description=f"Peserta '{participant.display_name}' {label_map[decision]} oleh {current_user.username}",
    )
    return {
        "id": participant.id,
        "display_name": participant.display_name,
        "operator_decision": participant.operator_decision,
        "updated_at": participant.updated_at,
    }


@router.post("/{participant_id}/admit")
async def admit_participant(
    participant_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await _decide(participant_id, OperatorDecision.admit, session, current_user)


@router.post("/{participant_id}/hold")
async def hold_participant(
    participant_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await _decide(participant_id, OperatorDecision.hold, session, current_user)


@router.post("/{participant_id}/reject")
async def reject_participant(
    participant_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await _decide(participant_id, OperatorDecision.reject, session, current_user)
