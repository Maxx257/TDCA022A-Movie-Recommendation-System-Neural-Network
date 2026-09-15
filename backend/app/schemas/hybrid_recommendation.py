from pydantic import BaseModel


class HybridRecommendationItem(BaseModel):
    tmdb_id: int
    score: float | None = None
    neural_score: float | None = None
    content_score: float | None = None
    matched_genres: list[str] = []


class HybridRecommendationResponse(BaseModel):
    strategy: str
    profile_interactions: int
    top_genres: list[str]
    results: list[HybridRecommendationItem]