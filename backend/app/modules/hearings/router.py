from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date, time, datetime

from app.database.session import get_session
from app.database.models import Hearing, ZoomMeeting, TransparansiStatus, WaitingParticipant, UserRole
from app.modules.auth.router import get_current_user, User
from app.modules.hearings.zoom_service import create_zoom_meeting
from app.utils.audit import log_action

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────

class HearingCreate(BaseModel):
    nomor_perkara: str
    tanggal_sidang: date
    jam_sidang: time
    jenis_sidang: str = "Pidana Biasa"
    status_transparansi: TransparansiStatus = TransparansiStatus.open

    @field_validator("nomor_perkara")
    @classmethod
    def nomor_perkara_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Nomor perkara tidak boleh kosong")
        return v.strip()


class HearingOut(BaseModel):
    id: str
    nomor_perkara: str
    tanggal_sidang: date
    jam_sidang: time
    jenis_sidang: str
    status_transparansi: str
    created_by: Optional[str]
    created_at: datetime
    zoom_meeting: Optional[dict] = None


class TemplateOut(BaseModel):
    nomor_perkara: str
    tanggal: str
    jam: str
    jenis_sidang: str
    status: str
    zoom_meeting_id: Optional[str]
    join_url: Optional[str]
    password: Optional[str]
    format_nama: str
    catatan: str
    teks_siap_salin: str


# ── Helpers ───────────────────────────────────────────────

BULAN_ID = {
    1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
    5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
    9: "September", 10: "Oktober", 11: "November", 12: "Desember",
}


def format_tanggal_id(d: date) -> str:
    return f"{d.day} {BULAN_ID[d.month]} {d.year}"


def hearing_to_out(h: Hearing, zm: Optional[ZoomMeeting] = None) -> HearingOut:
    return HearingOut(
        id=h.id,
        nomor_perkara=h.nomor_perkara,
        tanggal_sidang=h.tanggal_sidang,
        jam_sidang=h.jam_sidang,
        jenis_sidang=h.jenis_sidang,
        status_transparansi=h.status_transparansi,
        created_by=h.created_by,
        created_at=h.created_at,
        zoom_meeting={
            "zoom_meeting_id": zm.zoom_meeting_id,
            "join_url": zm.join_url,
            "password": zm.password,
        } if zm else None,
    )


# ── Endpoints ─────────────────────────────────────────────

@router.post("", response_model=HearingOut, status_code=201)
async def create_hearing(
    body: HearingCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    hearing = Hearing(
        nomor_perkara=body.nomor_perkara,
        tanggal_sidang=body.tanggal_sidang,
        jam_sidang=body.jam_sidang,
        jenis_sidang=body.jenis_sidang,
        status_transparansi=body.status_transparansi,
        created_by=current_user.id,
    )
    session.add(hearing)
    session.commit()
    session.refresh(hearing)

    log_action(
        action="CREATE_HEARING",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="hearing",
        entity_id=hearing.id,
        description=f"Sidang dibuat: {hearing.nomor_perkara}",
    )

    # Buat Zoom meeting
    zm = None
    try:
        from app.database.models import SystemSettings
        setting_topic = session.get(SystemSettings, "zoom_default_topic")
        template_topic = setting_topic.value if setting_topic else "[{status}] Sidang {nomor_perkara} - {jenis_sidang}"

        # Format string menggunakan replace untuk menghindari KeyError jika format kurang tepat
        topic = template_topic.replace("{nomor_perkara}", body.nomor_perkara)
        topic = topic.replace("{jenis_sidang}", body.jenis_sidang)
        topic = topic.replace("{status}", body.status_transparansi.upper())

        start_iso = datetime.combine(body.tanggal_sidang, body.jam_sidang).strftime(
            "%Y-%m-%dT%H:%M:%S"
        )
        zoom_data = await create_zoom_meeting(topic=topic, start_time=start_iso)

        zm = ZoomMeeting(
            hearing_id=hearing.id,
            zoom_meeting_id=str(zoom_data.get("id", "")),
            join_url=zoom_data.get("join_url", ""),
            start_url=zoom_data.get("start_url", ""),
            password=zoom_data.get("password", ""),
            topic=topic,
            waiting_room_enabled=True,
            mute_upon_entry=True,
        )
        session.add(zm)
        session.commit()
        session.refresh(zm)

        log_action(
            action="CREATE_ZOOM_MEETING",
            actor=current_user.username,
            actor_user_id=current_user.id,
            entity_type="zoom_meeting",
            entity_id=zm.id,
            description=f"Zoom meeting dibuat: {zm.zoom_meeting_id} untuk sidang {hearing.nomor_perkara}",
        )
    except Exception as e:
        log_action(
            action="ERROR_ZOOM_MEETING",
            actor=current_user.username,
            actor_user_id=current_user.id,
            entity_type="hearing",
            entity_id=hearing.id,
            description=f"Gagal membuat Zoom meeting: {str(e)}",
        )

    return hearing_to_out(hearing, zm)


@router.get("", response_model=List[HearingOut])
def list_hearings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Fix N+1: ambil semua hearing + zoom_meetings dalam 2 query
    hearings = session.exec(
        select(Hearing).order_by(Hearing.tanggal_sidang.desc(), Hearing.jam_sidang.desc())
    ).all()

    hearing_ids = [h.id for h in hearings]
    zoom_map: dict = {}
    if hearing_ids:
        zoom_meetings = session.exec(
            select(ZoomMeeting).where(ZoomMeeting.hearing_id.in_(hearing_ids))
        ).all()
        zoom_map = {zm.hearing_id: zm for zm in zoom_meetings}

    return [hearing_to_out(h, zoom_map.get(h.id)) for h in hearings]


@router.get("/{hearing_id}", response_model=HearingOut)
def get_hearing(
    hearing_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    hearing = session.get(Hearing, hearing_id)
    if not hearing:
        raise HTTPException(status_code=404, detail="Sidang tidak ditemukan")
    zm = session.exec(select(ZoomMeeting).where(ZoomMeeting.hearing_id == hearing_id)).first()
    return hearing_to_out(hearing, zm)


@router.get("/{hearing_id}/template", response_model=TemplateOut)
def get_hearing_template(
    hearing_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    hearing = session.get(Hearing, hearing_id)
    if not hearing:
        raise HTTPException(status_code=404, detail="Sidang tidak ditemukan")
    zm = session.exec(select(ZoomMeeting).where(ZoomMeeting.hearing_id == hearing_id)).first()

    tanggal_str = format_tanggal_id(hearing.tanggal_sidang)
    jam_str = hearing.jam_sidang.strftime("%H:%M") + " WIB"
    status_label = "TERBUKA UNTUK UMUM" if hearing.status_transparansi == TransparansiStatus.open else "TERTUTUP"
    format_nama = "JPU - [Nama] | PENASIHAT HUKUM - [Nama] | SAKSI - [Nama] | TERDAKWA - [Nama] | HAKIM - [Nama] | PANITERA - [Nama]"

    teks = f"""📋 INFORMASI SIDANG ELEKTRONIK — E-CAKRA
{'='*50}
Nomor Perkara : {hearing.nomor_perkara}
Tanggal       : {tanggal_str}
Jam           : {jam_str}
Jenis Sidang  : {hearing.jenis_sidang}
Status        : {status_label}
{'='*50}
🔗 Zoom Meeting ID : {zm.zoom_meeting_id if zm else '-'}
🔗 Join URL        : {zm.join_url if zm else '-'}
🔑 Password        : {zm.password if zm else '-'}
{'='*50}
📌 FORMAT NAMA PESERTA (WAJIB):
   JPU - [Nama Lengkap]
   PENASIHAT HUKUM - [Nama]
   SAKSI - [Nama]
   TERDAKWA - [Nama]
   HAKIM - [Nama]
   PANITERA - [Nama]
{'='*50}
⚠️  Masukkan nama sesuai format di atas sebelum bergabung.
    Peserta dengan nama tidak sesuai akan ditahan di waiting room."""

    return TemplateOut(
        nomor_perkara=hearing.nomor_perkara,
        tanggal=tanggal_str,
        jam=jam_str,
        jenis_sidang=hearing.jenis_sidang,
        status=status_label,
        zoom_meeting_id=zm.zoom_meeting_id if zm else None,
        join_url=zm.join_url if zm else None,
        password=zm.password if zm else None,
        format_nama=format_nama,
        catatan="Masukkan nama sesuai format yang ditentukan sebelum bergabung",
        teks_siap_salin=teks,
    )


@router.delete("/{hearing_id}", status_code=204)
def delete_hearing(
    hearing_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [UserRole.admin, UserRole.panitera]:
        raise HTTPException(status_code=403, detail="Hanya Admin atau Panitera yang dapat menghapus sidang")

    hearing = session.get(Hearing, hearing_id)
    if not hearing:
        raise HTTPException(status_code=404, detail="Sidang tidak ditemukan")

    nomor_perkara = hearing.nomor_perkara

    # Hapus peserta dan zoom meeting yang terkait
    participants = session.exec(select(WaitingParticipant).where(WaitingParticipant.hearing_id == hearing_id)).all()
    for p in participants:
        session.delete(p)

    zm = session.exec(select(ZoomMeeting).where(ZoomMeeting.hearing_id == hearing_id)).first()
    if zm:
        session.delete(zm)

    session.delete(hearing)
    session.commit()

    log_action(
        action="DELETE_HEARING",
        actor=current_user.username,
        actor_user_id=current_user.id,
        entity_type="hearing",
        entity_id=hearing_id,
        description=f"Sidang dihapus: {nomor_perkara}",
    )
    return None

@router.get("/{hearing_id}/participants")
def list_participants(
    hearing_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    hearing = session.get(Hearing, hearing_id)
    if not hearing:
        raise HTTPException(status_code=404, detail="Sidang tidak ditemukan")
    participants = session.exec(
        select(WaitingParticipant)
        .where(WaitingParticipant.hearing_id == hearing_id)
        .order_by(WaitingParticipant.joined_at.desc())
    ).all()
    return [
        {
            "id": p.id,
            "display_name": p.display_name,
            "validation_status": p.validation_status,
            "operator_decision": p.operator_decision,
            "joined_at": p.joined_at,
            "updated_at": p.updated_at,
        }
        for p in participants
    ]
