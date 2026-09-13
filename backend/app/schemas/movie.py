from pydantic import BaseModel


class MovieSummary(BaseModel):
    id: int
    title: str
    overview: str
    poster_url: str | None
    backdrop_url: str | None
    release_date: str | None
    vote_average: float
    vote_count: int
    popularity: float
    original_language: str
    genre_ids: list[int]


class MovieListResponse(BaseModel):
    page: int
    total_pages: int
    total_results: int
    results: list[MovieSummary]