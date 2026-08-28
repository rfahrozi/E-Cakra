from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date, time
from pydantic import BaseModel

from app.database.session import get_session
from app.database.models import Hearing, TransparansiStatus, SystemSettings

router = APIRouter()

class PublicHearingItem(BaseModel):
    nomor_perkara: str
    jam_sidang: time
    jenis_sidang: str
    status_transparansi: str

class PublicLandingResponse(BaseModel):
    pengadilan_nama: str
    public_streaming_url: str
    tanggal_hari_ini: date
    hearings: List[PublicHearingItem]

@router.get("/today", response_model=PublicLandingResponse)
def get_public_today(session: Session = Depends(get_session)):
    """Mengambil informasi sidang hari ini untuk portal publik."""
    today = date.today()

    # Ambil pengaturan
    nama_setting = session.get(SystemSettings, "pengadilan_nama")
    url_setting = session.get(SystemSettings, "public_streaming_url")

    pengadilan_nama = nama_setting.value if nama_setting and nama_setting.value else "Pengadilan Tinggi"
    public_streaming_url = url_setting.value if url_setting and url_setting.value else "#"

    # Ambil sidang HARI INI yang statusnya OPEN (Terbuka)
    hearings = session.exec(
        select(Hearing)
        .where(Hearing.tanggal_sidang == today)
        .where(Hearing.status_transparansi == TransparansiStatus.open)
        .order_by(Hearing.jam_sidang)
    ).all()

    items = [
        PublicHearingItem(
            nomor_perkara=h.nomor_perkara,
            jam_sidang=h.jam_sidang,
            jenis_sidang=h.jenis_sidang,
            status_transparansi=h.status_transparansi.value
        ) for h in hearings
    ]

    return PublicLandingResponse(
        pengadilan_nama=pengadilan_nama,
        public_streaming_url=public_streaming_url,
        tanggal_hari_ini=today,
        hearings=items
    )