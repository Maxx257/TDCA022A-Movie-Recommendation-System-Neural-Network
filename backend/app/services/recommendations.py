import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.rating import Rating
from app.models.view_history import ViewHistory
from app.services.tmdb import (
    get_movie_details,
    get_movie_recommendations,
    get_popular_movies,
)


def get_personalized_recommendations(
    user_id: int,
    db: Session,
    limit: int = 12,
) -> list[dict]:

    seed_scores: dict[int, float] = {}
    interacted_movie_ids: set[int] = set()

    # Ratings
    ratings = db.scalars(
        select(Rating).where(
            Rating.user_id == user_id
        )
    ).all()

    for rating in ratings:
        interacted_movie_ids.add(rating.movie_id)

        # Only strongly liked movies become seeds.
        if rating.rating >= 3.5:
            seed_scores[rating.movie_id] = (
                seed_scores.get(rating.movie_id, 0)
                + rating.rating * 2
            )

    # Favourites
    favorites = db.scalars(
        select(Favorite).where(
            Favorite.user_id == user_id
        )
    ).all()

    for favorite in favorites:
        interacted_movie_ids.add(favorite.movie_id)

        seed_scores[favorite.movie_id] = (
            seed_scores.get(favorite.movie_id, 0)
            + 6
        )

    # Viewing history
    history = db.scalars(
        select(ViewHistory).where(
            ViewHistory.user_id == user_id
        )
    ).all()

    for history_item in history:
        interacted_movie_ids.add(history_item.movie_id)

        seed_scores[history_item.movie_id] = (
            seed_scores.get(history_item.movie_id, 0)
            + min(history_item.view_count, 5)
        )

    # New user / no interaction fallback.
    if not seed_scores:
        popular = get_popular_movies()

        return popular["results"][:limit]

    # Pick the user's strongest interests.
    seed_movies = sorted(
        seed_scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )[:5]

    recommendations: dict[int, dict] = {}
    recommendation_scores: dict[int, float] = {}

    for seed_movie_id, seed_score in seed_movies:
        try:
            data = get_movie_recommendations(
                seed_movie_id
            )
        except (
            httpx.HTTPStatusError,
            httpx.RequestError,
        ):
            continue

        for position, movie in enumerate(
            data["results"]
        ):
            movie_id = movie["id"]

            # Do not recommend movies the user
            # has already interacted with.
            if movie_id in interacted_movie_ids:
                continue

            recommendations[movie_id] = movie

            # Movies appearing earlier in TMDB's
            # recommendation list get slightly more weight.
            rank_bonus = max(
                0,
                20 - position,
            ) / 20

            recommendation_scores[movie_id] = (
                recommendation_scores.get(
                    movie_id,
                    0,
                )
                + seed_score
                + rank_bonus
            )

    ranked_movie_ids = sorted(
        recommendation_scores,
        key=recommendation_scores.get,
        reverse=True,
    )

    final_movies = [
        recommendations[movie_id]
        for movie_id in ranked_movie_ids[:limit]
    ]

    # Fallback if recommendation results are empty.
    if not final_movies:
        popular = get_popular_movies()

        final_movies = [
            movie
            for movie in popular["results"]
            if movie["id"]
            not in interacted_movie_ids
        ][:limit]

    return final_movies

def get_because_you_liked(
    user_id: int,
    db: Session,
    limit: int = 6,
) -> dict:

    favorite = db.scalar(
        select(Favorite)
        .where(
            Favorite.user_id == user_id
        )
        .order_by(
            Favorite.created_at.desc()
        )
    )

    if favorite is None:
        return {
            "seed_movie_id": None,
            "seed_title": None,
            "results": [],
        }

    seed_movie_id = favorite.movie_id

    seed_details = get_movie_details(
        seed_movie_id
    )

    interacted_movie_ids: set[int] = set()

    favorites = db.scalars(
        select(Favorite).where(
            Favorite.user_id == user_id
        )
    ).all()

    ratings = db.scalars(
        select(Rating).where(
            Rating.user_id == user_id
        )
    ).all()

    history = db.scalars(
        select(ViewHistory).where(
            ViewHistory.user_id == user_id
        )
    ).all()

    interacted_movie_ids.update(
        item.movie_id
        for item in favorites
    )

    interacted_movie_ids.update(
        item.movie_id
        for item in ratings
    )

    interacted_movie_ids.update(
        item.movie_id
        for item in history
    )

    recommendation_data = (
        get_movie_recommendations(
            seed_movie_id
        )
    )

    recommendations = [
        movie
        for movie in recommendation_data["results"]
        if movie["id"]
        not in interacted_movie_ids
    ][:limit]

    return {
        "seed_movie_id": seed_movie_id,
        "seed_title": seed_details["title"],
        "results": recommendations,
    }