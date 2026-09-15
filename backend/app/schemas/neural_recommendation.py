from pydantic import BaseModel


class NeuralRecommendationItem(BaseModel):
    tmdb_id: int
    score: float


class NeuralRecommendationResponse(BaseModel):
    strategy: str
    profile_interactions: int
    results: list[NeuralRecommendationItem]