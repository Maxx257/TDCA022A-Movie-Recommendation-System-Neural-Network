from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.watchlist import Watchlist
from app.schemas.watchlist import (
    WatchlistCreate,
    WatchlistResponse,
    WatchlistStatusResponse,
)


router = APIRouter(
    prefix="/watchlist",
    tags=["Watchlist"],
)


@router.post(
    "",
    response_model=WatchlistResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_to_watchlist(
    data: WatchlistCreate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    existing_item = db.scalar(
        select(Watchlist).where(
            Watchlist.user_id
            == current_user.id,
            Watchlist.movie_id
            == data.movie_id,
        )
    )

    if existing_item:
        raise HTTPException(
            status_code=409,
            detail="Movie is already in watchlist",
        )

    watchlist_item = Watchlist(
        user_id=current_user.id,
        movie_id=data.movie_id,
    )

    db.add(watchlist_item)
    db.commit()
    db.refresh(watchlist_item)

    return watchlist_item


@router.get(
    "",
    response_model=list[WatchlistResponse],
)
def get_watchlist(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    items = db.scalars(
        select(Watchlist)
        .where(
            Watchlist.user_id
            == current_user.id
        )
        .order_by(
            Watchlist.created_at.desc()
        )
    ).all()

    return items


@router.get(
    "/{movie_id}/status",
    response_model=WatchlistStatusResponse,
)
def get_watchlist_status(
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
    item = db.scalar(
        select(Watchlist).where(
            Watchlist.user_id
            == current_user.id,
            Watchlist.movie_id
            == movie_id,
        )
    )

    return {
        "in_watchlist": item is not None
    }


@router.delete(
    "/{movie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_from_watchlist(
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
    item = db.scalar(
        select(Watchlist).where(
            Watchlist.user_id
            == current_user.id,
            Watchlist.movie_id
            == movie_id,
        )
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Movie is not in watchlist",
        )

    db.delete(item)
    db.commit()