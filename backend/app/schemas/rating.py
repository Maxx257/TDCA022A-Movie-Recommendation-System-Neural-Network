from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RatingCreate(BaseModel):
    movie_id: int = Field(gt=0)
    rating: float = Field(
        ge=0.5,
        le=5.0,
        multiple_of=0.5,
    )


class RatingUpdate(BaseModel):
    rating: float = Field(
        ge=0.5,
        le=5.0,
        multiple_of=0.5,
    )


class RatingResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    rating: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RatingStatus(BaseModel):
    movie_id: int
    rating: float | None