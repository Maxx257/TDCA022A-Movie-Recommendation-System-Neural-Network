from pydantic import BaseModel

from app.schemas.movie import MovieSummary


class BecauseYouLikedResponse(BaseModel):
    seed_movie_id: int | None
    seed_title: str | None
    results: list[MovieSummary]