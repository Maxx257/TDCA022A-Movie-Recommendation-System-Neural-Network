import httpx
from fastapi import APIRouter, HTTPException, Query

from app.schemas.movie import (
    GenreListResponse,
    MovieDetails,
    MovieListResponse,
)
from app.services.tmdb import (
    discover_movies,
    get_movie_details,
    get_movie_genres,
    get_popular_movies,
    search_movies,
)

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

@router.get(
    "/search",
    response_model=MovieListResponse,
)
def movie_search(
    query: str = Query(min_length=1),
    page: int = Query(default=1, ge=1),
):
    try:
        return search_movies(
            query=query,
            page=page,
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
    "/genres",
    response_model=GenreListResponse,
)
def movie_genres():
    try:
        return get_movie_genres()

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
    "/discover",
    response_model=MovieListResponse,
)
def movie_discover(
    genre_id: int | None = Query(default=None, ge=1),
    page: int = Query(default=1, ge=1),
):
    try:
        return discover_movies(
            page=page,
            genre_id=genre_id,
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
    "/{movie_id}",
    response_model=MovieDetails,
)
def movie_details(movie_id: int):
    try:
        return get_movie_details(movie_id)

    except httpx.HTTPStatusError as error:
        if error.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="Movie not found",
            )

        raise HTTPException(
            status_code=502,
            detail="TMDB returned an error",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to TMDB",
        )