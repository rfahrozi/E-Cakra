from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date, time
from pydantic import BaseModel

from app.database.session import get_session
from app.database.models import Hearing, TransparansiStatus, SystemSettings

router = APIRouter()

class PublicHearingItem(BaseModel):
    id: str
    nomor_perkara: str
    tanggal_sidang: date
    jam_sidang: time
    jenis_sidang: str
    status_transparansi: str
    terdakwa: Optional[str]
    pengadilan_pengirim: Optional[str]
    agenda: Optional[str]
    status_sidang: str
    zoom_meeting_id: Optional[str] = None
    join_url: Optional[str] = None

class PublicLandingResponse(BaseModel):
    pengadilan_nama: str
    public_streaming_url: str
    tanggal_hari_ini: date
    hearings: List[PublicHearingItem]

@router.get("/hearings", response_model=PublicLandingResponse)
def get_public_hearings(session: Session = Depends(get_session)):
    """Mengambil informasi seluruh sidang terbuka untuk portal publik."""
    from app.database.models import ZoomMeeting

    today = date.today()

    # Ambil pengaturan
    nama_setting = session.get(SystemSettings, "pengadilan_nama")
    url_setting = session.get(SystemSettings, "public_streaming_url")

    pengadilan_nama = nama_setting.value if nama_setting and nama_setting.value else "Pengadilan Tinggi"
    public_streaming_url = url_setting.value if url_setting and url_setting.value else "#"

    # Ambil SEMUA sidang yang statusnya OPEN (Terbuka)
    hearings = session.exec(
        select(Hearing)
        .where(Hearing.status_transparansi == TransparansiStatus.open)
        .order_by(Hearing.tanggal_sidang.asc(), Hearing.jam_sidang.asc())
    ).all()

    # Ambil Zoom Meetings untuk sidang-sidang tersebut
    hearing_ids = [h.id for h in hearings]
    zoom_map = {}
    if hearing_ids:
        zms = session.exec(select(ZoomMeeting).where(ZoomMeeting.hearing_id.in_(hearing_ids))).all()
        zoom_map = {zm.hearing_id: zm for zm in zms}

    items = [
        PublicHearingItem(
            id=h.id,
            nomor_perkara=h.nomor_perkara,
            tanggal_sidang=h.tanggal_sidang,
            jam_sidang=h.jam_sidang,
            jenis_sidang=h.jenis_sidang,
            status_transparansi=h.status_transparansi.value,
            terdakwa=h.terdakwa,
            pengadilan_pengirim=h.pengadilan_pengirim,
            agenda=h.agenda,
            status_sidang=h.status_sidang.value if hasattr(h.status_sidang, 'value') else h.status_sidang,
            zoom_meeting_id=zoom_map[h.id].zoom_meeting_id if h.id in zoom_map else None,
            join_url=zoom_map[h.id].join_url if h.id in zoom_map else None,
        ) for h in hearings
    ]

    return PublicLandingResponse(
        pengadilan_nama=pengadilan_nama,
        public_streaming_url=public_streaming_url,
        tanggal_hari_ini=today,
        hearings=items
    )