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
