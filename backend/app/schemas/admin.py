from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_users: int
    total_favourites: int
    total_watchlist_items: int
    total_ratings: int
    total_viewed_movies: int
    total_views: int
    average_rating: float | None


class AdminMovieAnalyticsItem(BaseModel):
    movie_id: int
    favourites: int
    watchlist: int
    ratings: int
    views: int
    total_interactions: int


class AdminMovieAnalyticsResponse(BaseModel):
    results: list[AdminMovieAnalyticsItem]


class ModelInfo(BaseModel):
    name: str
    type: str
    framework: str
    embedding_dimension: int
    selection_status: str


class ModelDatasetInfo(BaseModel):
    name: str
    users: int
    movies: int
    ratings: int
    training_ratings: int
    validation_ratings: int
    test_ratings: int
    split_strategy: str


class ModelPerformance(BaseModel):
    mae: float
    rmse: float
    hit_rate_at_10: float
    ndcg_at_10: float
    mrr: float


class PreviousModelPerformance(BaseModel):
    name: str
    mae: float
    rmse: float
    hit_rate_at_10: float
    ndcg_at_10: float
    mrr: float


class ModelBaseline(BaseModel):
    name: str
    mae: float
    rmse: float


class MetricExplanation(BaseModel):
    mae: str
    rmse: str
    hit_rate_at_10: str
    ndcg_at_10: str
    mrr: str


class AdminModelInsightsResponse(BaseModel):
    model: ModelInfo
    dataset: ModelDatasetInfo
    performance: ModelPerformance
    previous_model: PreviousModelPerformance
    baselines: list[ModelBaseline]
    explanation: MetricExplanation
    selection_note: str