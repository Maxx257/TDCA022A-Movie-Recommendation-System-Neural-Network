from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database import get_db
from app.models.rating import Rating
from app.models.user import User
from app.schemas.rating import (
    RatingCreate,
    RatingResponse,
    RatingStatus,
    RatingUpdate,
)


router = APIRouter(
    prefix="/ratings",
    tags=["Ratings"],
)


@router.post(
    "",
    response_model=RatingResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_rating(
    rating_data: RatingCreate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    existing_rating = db.scalar(
        select(Rating).where(
            Rating.user_id == current_user.id,
            Rating.movie_id == rating_data.movie_id,
        )
    )

    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already rated this movie",
        )

    rating = Rating(
        user_id=current_user.id,
        movie_id=rating_data.movie_id,
        rating=rating_data.rating,
    )

    db.add(rating)

    try:
        db.commit()
        db.refresh(rating)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already rated this movie",
        )

    return rating


@router.get(
    "",
    response_model=list[RatingResponse],
)
def get_ratings(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    ratings = db.scalars(
        select(Rating)
        .where(
            Rating.user_id == current_user.id
        )
        .order_by(Rating.updated_at.desc())
    ).all()

    return ratings


@router.get(
    "/{movie_id}",
    response_model=RatingStatus,
)
def get_movie_rating(
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
    rating = db.scalar(
        select(Rating).where(
            Rating.user_id == current_user.id,
            Rating.movie_id == movie_id,
        )
    )

    return {
        "movie_id": movie_id,
        "rating": rating.rating if rating else None,
    }


@router.put(
    "/{movie_id}",
    response_model=RatingResponse,
)
def update_rating(
    movie_id: int,
    rating_data: RatingUpdate,
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    rating = db.scalar(
        select(Rating).where(
            Rating.user_id == current_user.id,
            Rating.movie_id == movie_id,
        )
    )

    if rating is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found",
        )

    rating.rating = rating_data.rating

    db.commit()
    db.refresh(rating)

    return rating


@router.delete(
    "/{movie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_rating(
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
    rating = db.scalar(
        select(Rating).where(
            Rating.user_id == current_user.id,
            Rating.movie_id == movie_id,
        )
    )

    if rating is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found",
        )

    db.delete(rating)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )