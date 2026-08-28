from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import date, datetime

from app.database.session import get_session
from app.database.models import Hearing, WaitingParticipant, AuditLog, OperatorDecision
from app.modules.auth.router import get_current_user, User

router = APIRouter()


@router.get("/summary")
def dashboard_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    # Sidang hari ini
    sidang_hari_ini = session.exec(
        select(func.count(Hearing.id)).where(Hearing.tanggal_sidang == today)
    ).one()

    # Peserta menunggu (belum ada keputusan operator)
    peserta_menunggu = session.exec(
        select(func.count(WaitingParticipant.id)).where(
            WaitingParticipant.operator_decision == None  # noqa: E711
        )
    ).one()

    # Audit event hari ini
    audit_hari_ini = session.exec(
        select(func.count(AuditLog.id)).where(
            AuditLog.created_at >= today_start,
            AuditLog.created_at <= today_end,
        )
    ).one()

    # Daftar sidang hari ini (untuk quick view)
    sidang_list = session.exec(
        select(Hearing)
        .where(Hearing.tanggal_sidang == today)
        .order_by(Hearing.jam_sidang)
    ).all()

    return {
        "sidang_hari_ini": sidang_hari_ini,
        "peserta_menunggu": peserta_menunggu,
        "audit_event_hari_ini": audit_hari_ini,
        "sidang_list": [
            {
                "id": h.id,
                "nomor_perkara": h.nomor_perkara,
                "jam_sidang": str(h.jam_sidang),
                "jenis_sidang": h.jenis_sidang,
                "status_transparansi": h.status_transparansi,
            }
            for h in sidang_list
        ],
    }
