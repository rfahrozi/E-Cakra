from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from datetime import datetime

from app.database.session import get_session
from app.database.models import WaitingParticipant, OperatorDecision
from app.modules.auth.router import get_current_user, User
from app.utils.audit import log_action

router = APIRouter()


def _decide(
    participant_id: str,
    decision: OperatorDecision,
    session: Session,
    current_user: User,
):
    participant = session.get(WaitingParticipant, participant_id)
    if not participant:
        raise HTTPException(status_code=404, detail="Peserta tidak ditemukan")

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
def admit_participant(
    participant_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return _decide(participant_id, OperatorDecision.admit, session, current_user)


@router.post("/{participant_id}/hold")
def hold_participant(
    participant_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return _decide(participant_id, OperatorDecision.hold, session, current_user)


@router.post("/{participant_id}/reject")
def reject_participant(
    participant_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return _decide(participant_id, OperatorDecision.reject, session, current_user)
