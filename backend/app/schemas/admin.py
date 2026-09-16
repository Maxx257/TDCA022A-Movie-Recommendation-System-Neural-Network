from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_users: int
    total_favourites: int
    total_watchlist_items: int
    total_ratings: int
    total_viewed_movies: int
    total_views: int
    average_rating: float | None

from pydantic import BaseModel


class AdminMovieAnalyticsItem(BaseModel):
    movie_id: int
    favourites: int
    watchlist: int
    ratings: int
    views: int
    total_interactions: int


class AdminMovieAnalyticsResponse(BaseModel):
    results: list[AdminMovieAnalyticsItem]