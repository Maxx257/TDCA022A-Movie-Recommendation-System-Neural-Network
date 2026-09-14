from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ViewHistoryResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    view_count: int
    last_viewed_at: datetime

    model_config = ConfigDict(from_attributes=True)