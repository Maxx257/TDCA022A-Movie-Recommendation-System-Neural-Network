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


class CastMember(BaseModel):
    id: int
    name: str
    character: str
    profile_url: str | None


class TrailerInfo(BaseModel):
    key: str
    name: str
    site: str
    type: str
    official: bool


class MovieDetails(BaseModel):
    id: int
    title: str
    overview: str
    poster_url: str | None
    backdrop_url: str | None
    release_date: str | None
    vote_average: float
    vote_count: int
    runtime: int | None
    original_language: str
    genres: list[str]
    cast: list[CastMember]
    trailer: TrailerInfo | None = None


class Genre(BaseModel):
    id: int
    name: str


class GenreListResponse(BaseModel):
    genres: list[Genre]