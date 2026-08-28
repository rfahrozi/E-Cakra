from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime

from app.database.session import get_session
from app.database.models import Task, TaskPriority, TaskStatus
from app.modules.auth.router import get_current_user, User

router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[date] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[date] = None

class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    priority: str
    status: str
    due_date: Optional[date]
    created_at: datetime
    assigned_to: Optional[str]

@router.get("", response_model=List[TaskOut])
def list_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    tasks = session.exec(
        select(Task)
        .where(Task.assigned_to == current_user.id)
        .order_by(Task.due_date, Task.created_at.desc())
    ).all()
    return tasks

@router.post("", response_model=TaskOut)
def create_task(
    body: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        title=body.title,
        description=body.description,
        priority=body.priority,
        due_date=body.due_date,
        assigned_to=current_user.id
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    body: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = session.get(Task, task_id)
    if not task or task.assigned_to != current_user.id:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")

    if body.title is not None: task.title = body.title
    if body.description is not None: task.description = body.description
    if body.priority is not None: task.priority = body.priority
    if body.status is not None: task.status = body.status
    if body.due_date is not None: task.due_date = body.due_date

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = session.get(Task, task_id)
    if not task or task.assigned_to != current_user.id:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")

    session.delete(task)
    session.commit()
    return None
