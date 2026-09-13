from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FavoriteCreate(BaseModel):
    movie_id: int = Field(gt=0)


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FavoriteStatus(BaseModel):
    movie_id: int
    is_favorite: bool