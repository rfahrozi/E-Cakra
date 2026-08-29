"""
Inisialisasi database dan seed data awal.
Dijalankan saat container startup.
"""
from sqlmodel import Session, select
from app.database.session import engine, create_db_and_tables
from app.database.models import User, UserRole, SystemSettings
from app.core.security import hash_password


def seed_default_users(session: Session):
    """Buat user default jika belum ada."""
    users_to_seed = [
        {
            "nama": "Administrator",
            "username": "admin",
            "password": "admin123",
            "role": UserRole.admin,
        },
        {
            "nama": "Operator Sidang",
            "username": "operator",
            "password": "operator123",
            "role": UserRole.operator,
        },
        {
            "nama": "Panitera",
            "username": "panitera",
            "password": "panitera123",
            "role": UserRole.panitera,
        },
    ]

    for u in users_to_seed:
        existing = session.exec(select(User).where(User.username == u["username"])).first()
        if not existing:
            user = User(
                nama=u["nama"],
                username=u["username"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
            )
            session.add(user)
            print(f"  ✅ Seed user: {u['username']}")
        else:
            print(f"  ⏭  User sudah ada: {u['username']}")

    session.commit()


def seed_default_settings(session: Session):
    """Buat settings default jika belum ada."""
    settings_to_seed = [
        {
            "key": "pengadilan_nama",
            "value": "Pengadilan Tinggi Contoh",
            "description": "Nama pengadilan untuk ditampilkan di aplikasi",
        },
        {
            "key": "zoom_default_topic",
            "value": "[SIDANG] {nomor_perkara} - {jenis_sidang}",
            "description": "Template judul Zoom (gunakan {nomor_perkara} dan {jenis_sidang})",
        },
        {
            "key": "public_streaming_url",
            "value": "https://youtube.com/@pengadilantinggi",
            "description": "Link kanal streaming publik resmi pengadilan",
        },
        {
            "key": "zoom_stream_rtmp_url",
            "value": "",
            "description": "RTMP Ingest URL dari YouTube Live (contoh: rtmp://a.rtmp.youtube.com/live2)",
        },
        {
            "key": "zoom_stream_key",
            "value": "",
            "description": "Stream Key rahasia dari YouTube Live untuk Zoom Custom Livestream (F-019). Isi dari YouTube Studio → Go Live → Stream Key.",
        },
        {
            "key": "list_pengadilan_negeri",
            "value": "Pengadilan Negeri Tanjungpinang,Pengadilan Negeri Batam,Pengadilan Negeri Tanjung Balai Karimun,Pengadilan Negeri Natuna",
            "description": "Daftar Pengadilan Negeri pengirim (pisahkan dengan koma)",
        },
        {
            "key": "list_kejaksaan_negeri",
            "value": "Kejaksaan Negeri Tanjungpinang,Kejaksaan Negeri Batam,Kejaksaan Negeri Bintan,Kejaksaan Negeri Lingga,Kejaksaan Negeri Karimun,Kejaksaan Negeri Natuna,Kejaksaan Negeri Kepulauan Anambas,Cabang Kejaksaan Negeri Karimun di Moro,Cabang Kejaksaan Negeri Karimun di Tanjungbatu",
            "description": "Daftar Kejaksaan Negeri dan Cabangnya (pisahkan dengan koma)",
        },
        {
            "key": "list_rutan",
            "value": "Rutan Kelas I Tanjungpinang,Rutan Kelas IIA Batam,Rutan Kelas IIB Tanjung Balai Karimun",
            "description": "Daftar Lapas atau Rutan (pisahkan dengan koma)",
        },
        {
            "key": "list_hakim",
            "value": "Drs. ARIFIN S.H. M.Hum.,Dr ZULFAHMI S.H. M.Hum.,BAGUS IRAWAN S.H. M.H,WENDRA RAIS S.H. M.H,ELIWARTI S.H. M.H.,DAHLIA PANJAITAN S.H.,MORGAN SIMANJUNTAK S.H. M.Hum.,ELFIAN S.H. M.H.,ESTIONO S.H. M.H.,Dr. H. M. SURYADI S.H. M.H.,RUDY SUDIANTO S.H. M.M.",
            "description": "Daftar Hakim (Ketua / Anggota / Ad Hoc) dipisahkan koma",
        },
        {
            "key": "list_panitera",
            "value": "SAPTA PUTRA S.H.,NURLAILI S.H. M.H.,AGUSMAN S.H. M.H.,SYAIFUL ISLAMI S.H.,SUPRIADI S.H.",
            "description": "Daftar Panitera / Panitera Muda / Pengganti dipisahkan koma",
        },
    ]

    for s in settings_to_seed:
        existing = session.get(SystemSettings, s["key"])
        if not existing:
            setting = SystemSettings(**s)
            session.add(setting)
            print(f"  ✅ Seed setting: {s['key']}")
        else:
            print(f"  ⏭  Setting sudah ada: {s['key']}")

    session.commit()


if __name__ == "__main__":
    print("🔧 Membuat tabel database...")
    create_db_and_tables()
    print("🌱 Seeding data awal...")
    with Session(engine) as session:
        seed_default_users(session)
        seed_default_settings(session)
    print("✅ Inisialisasi database selesai.")
