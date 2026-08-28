from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum
import uuid


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ── Enums ─────────────────────────────────────────────────

class UserRole(str, Enum):
    admin = "admin"
    operator = "operator"
    panitera = "panitera"


class TransparansiStatus(str, Enum):
    open = "open"
    closed = "closed"


class ValidationStatus(str, Enum):
    valid = "valid"
    review = "review"
    invalid = "invalid"


class OperatorDecision(str, Enum):
    admit = "admit"
    hold = "hold"
    reject = "reject"


# ── Models ────────────────────────────────────────────────

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=gen_uuid, primary_key=True)
    nama: str = Field(max_length=150)
    username: str = Field(max_length=80, unique=True, index=True)
    password_hash: str
    role: UserRole = Field(default=UserRole.operator)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    hearings: List["Hearing"] = Relationship(back_populates="creator")
    audit_logs: List["AuditLog"] = Relationship(back_populates="actor_user")
    tasks: List["Task"] = Relationship(back_populates="assignee")


class Hearing(SQLModel, table=True):
    __tablename__ = "hearings"

    id: str = Field(default_factory=gen_uuid, primary_key=True)
    nomor_perkara: str = Field(max_length=200, index=True)
    tanggal_sidang: date
    jam_sidang: time
    jenis_sidang: str = Field(max_length=100, default="Pidana Biasa")
    status_transparansi: TransparansiStatus = Field(default=TransparansiStatus.open)
    created_by: Optional[str] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    creator: Optional[User] = Relationship(back_populates="hearings")
    zoom_meeting: Optional["ZoomMeeting"] = Relationship(back_populates="hearing")
    participants: List["WaitingParticipant"] = Relationship(back_populates="hearing")


class ZoomMeeting(SQLModel, table=True):
    __tablename__ = "zoom_meetings"

    id: str = Field(default_factory=gen_uuid, primary_key=True)
    hearing_id: str = Field(foreign_key="hearings.id", unique=True, index=True)
    zoom_meeting_id: str = Field(max_length=50, index=True)
    join_url: str
    start_url: str
    password: str = Field(default="", max_length=50)
    topic: str = Field(default="")
    waiting_room_enabled: bool = Field(default=True)
    mute_upon_entry: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    hearing: Optional[Hearing] = Relationship(back_populates="zoom_meeting")


class WaitingParticipant(SQLModel, table=True):
    __tablename__ = "waiting_participants"

    id: str = Field(default_factory=gen_uuid, primary_key=True)
    hearing_id: str = Field(foreign_key="hearings.id", index=True)
    display_name: str = Field(max_length=200)
    validation_status: ValidationStatus = Field(default=ValidationStatus.review)
    operator_decision: Optional[OperatorDecision] = Field(default=None)
    source_event_id: Optional[str] = Field(default=None, max_length=200)
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    hearing: Optional[Hearing] = Relationship(back_populates="participants")


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: str = Field(default_factory=gen_uuid, primary_key=True)
    actor: str = Field(max_length=100, default="system")
    actor_user_id: Optional[str] = Field(default=None, foreign_key="users.id")
    action: str = Field(max_length=100, index=True)
    entity_type: str = Field(max_length=50, default="")
    entity_id: str = Field(max_length=100, default="")
    description: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    actor_user: Optional[User] = Relationship(back_populates="audit_logs")

class TaskPriority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"

class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: str = Field(default_factory=gen_uuid, primary_key=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    priority: TaskPriority = Field(default=TaskPriority.medium)
    status: TaskStatus = Field(default=TaskStatus.pending)
    due_date: Optional[date] = Field(default=None)
    assigned_to: Optional[str] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    assignee: Optional[User] = Relationship(back_populates="tasks")

class SystemSettings(SQLModel, table=True):
    __tablename__ = "system_settings"

    key: str = Field(primary_key=True, max_length=100)
    value: str = Field(default="")
    description: Optional[str] = Field(default=None)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
