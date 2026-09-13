from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database import get_db
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.favorite import (
    FavoriteCreate,
    FavoriteResponse,
    FavoriteStatus,
)


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"],
)


@router.post(
    "",
    response_model=FavoriteResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    existing_favorite = db.scalar(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.movie_id == favorite_data.movie_id,
        )
    )

    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Movie is already in favorites",
        )

    favorite = Favorite(
        user_id=current_user.id,
        movie_id=favorite_data.movie_id,
    )

    db.add(favorite)

    try:
        db.commit()
        db.refresh(favorite)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Movie is already in favorites",
        )

    return favorite


@router.get(
    "",
    response_model=list[FavoriteResponse],
)
def get_favorites(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    favorites = db.scalars(
        select(Favorite)
        .where(
            Favorite.user_id == current_user.id
        )
        .order_by(Favorite.created_at.desc())
    ).all()

    return favorites


@router.get(
    "/{movie_id}/status",
    response_model=FavoriteStatus,
)
def get_favorite_status(
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
    favorite = db.scalar(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.movie_id == movie_id,
        )
    )

    return {
        "movie_id": movie_id,
        "is_favorite": favorite is not None,
    }


@router.delete(
    "/{movie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_favorite(
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
    favorite = db.scalar(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.movie_id == movie_id,
        )
    )

    if favorite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie is not in favorites",
        )

    db.delete(favorite)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )