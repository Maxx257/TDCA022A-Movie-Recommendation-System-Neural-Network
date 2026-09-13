import httpx
from fastapi import APIRouter, HTTPException, Query

from app.schemas.movie import MovieListResponse
from app.services.tmdb import get_popular_movies


router = APIRouter(
    prefix="/movies",
    tags=["Movies"],
)


@router.get(
    "/popular",
    response_model=MovieListResponse,
)
def popular_movies(
    page: int = Query(default=1, ge=1),
):
    try:
        return get_popular_movies(page)

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