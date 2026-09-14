from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.view_history import ViewHistory
from app.schemas.view_history import ViewHistoryResponse


router = APIRouter(
    prefix="/history",
    tags=["Viewing History"],
)


@router.post(
    "/{movie_id}",
    response_model=ViewHistoryResponse,
)
def record_movie_view(
    movie_id: int,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    history_item = db.scalar(
        select(ViewHistory).where(
            ViewHistory.user_id == current_user.id,
            ViewHistory.movie_id == movie_id,
        )
    )

    if history_item:
        history_item.view_count += 1
        history_item.last_viewed_at = datetime.now(
            timezone.utc
        )

    else:
        history_item = ViewHistory(
            user_id=current_user.id,
            movie_id=movie_id,
            view_count=1,
            last_viewed_at=datetime.now(
                timezone.utc
            ),
        )

        db.add(history_item)

    db.commit()
    db.refresh(history_item)

    return history_item


@router.get(
    "",
    response_model=list[ViewHistoryResponse],
)
def get_view_history(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    history = db.scalars(
        select(ViewHistory)
        .where(
            ViewHistory.user_id == current_user.id
        )
        .order_by(
            ViewHistory.last_viewed_at.desc()
        )
    ).all()

    return history