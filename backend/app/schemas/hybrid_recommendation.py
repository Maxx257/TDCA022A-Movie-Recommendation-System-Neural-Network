from pydantic import BaseModel


class HybridRecommendationItem(BaseModel):
    tmdb_id: int
    score: float
    neural_score: float
    content_score: float
    matched_genres: list[str]


class HybridRecommendationResponse(BaseModel):
    strategy: str
    profile_interactions: int
    top_genres: list[str]
    results: list[HybridRecommendationItem]