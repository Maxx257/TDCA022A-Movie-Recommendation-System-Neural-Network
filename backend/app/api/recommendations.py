from typing import Annotated

import httpx
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.movie import MovieSummary
from app.services.recommendations import (
    get_because_you_liked,
    get_personalized_recommendations,
)
from app.schemas.recommendation import (
    BecauseYouLikedResponse,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.get(
    "/for-me",
    response_model=list[MovieSummary],
)
def recommendations_for_me(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    limit: int = Query(
        default=12,
        ge=1,
        le=20,
    ),
):
    try:
        return get_personalized_recommendations(
            user_id=current_user.id,
            db=db,
            limit=limit,
        )

    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=502,
            detail="TMDB returned an error",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to TMDB",
        )

@router.get(
    "/because-you-liked",
    response_model=BecauseYouLikedResponse,
)
def because_you_liked(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    limit: int = Query(
        default=6,
        ge=1,
        le=20,
    ),
):
    try:
        return get_because_you_liked(
            user_id=current_user.id,
            db=db,
            limit=limit,
        )

    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=502,
            detail="TMDB returned an error",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to TMDB",
        )