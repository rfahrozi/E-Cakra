"""
Konfigurasi pytest untuk E-CAKRA backend tests.
Menggunakan SQLite in-memory agar test bisa berjalan tanpa PostgreSQL.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool

from app.main import app
from app.database.session import get_session
from app.database.models import User, UserRole
from app.core.security import hash_password, create_access_token


# ── Engine SQLite in-memory untuk test ────────────────────
@pytest.fixture(name="engine", scope="session")
def engine_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="session")
def session_fixture(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session):
    """TestClient dengan DB di-override ke SQLite in-memory."""
    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


# ── Seed users untuk test ─────────────────────────────────
@pytest.fixture(name="admin_user")
def admin_user_fixture(session):
    user = User(
        nama="Admin Test",
        username="admin_test",
        password_hash=hash_password("admin123"),
        role=UserRole.admin,
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    yield user
    session.delete(user)
    session.commit()


@pytest.fixture(name="operator_user")
def operator_user_fixture(session):
    user = User(
        nama="Operator Test",
        username="operator_test",
        password_hash=hash_password("operator123"),
        role=UserRole.operator,
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    yield user
    session.delete(user)
    session.commit()


@pytest.fixture(name="panitera_user")
def panitera_user_fixture(session):
    user = User(
        nama="Panitera Test",
        username="panitera_test",
        password_hash=hash_password("panitera123"),
        role=UserRole.panitera,
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    yield user
    session.delete(user)
    session.commit()


@pytest.fixture(name="admin_token")
def admin_token_fixture(admin_user):
    return create_access_token({"sub": admin_user.username, "role": admin_user.role})


@pytest.fixture(name="operator_token")
def operator_token_fixture(operator_user):
    return create_access_token({"sub": operator_user.username, "role": operator_user.role})


@pytest.fixture(name="panitera_token")
def panitera_token_fixture(panitera_user):
    return create_access_token({"sub": panitera_user.username, "role": panitera_user.role})


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
