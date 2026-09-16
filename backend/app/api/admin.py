from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import get_current_admin
from app.database import get_db
from app.models.favorite import Favorite
from app.models.rating import Rating
from app.models.user import User
from app.models.view_history import ViewHistory
from app.models.watchlist import Watchlist
from app.schemas.admin import (
    AdminMovieAnalyticsResponse,
    AdminStatsResponse,
)
from collections import defaultdict


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/stats",
    response_model=AdminStatsResponse,
)
def get_admin_stats(
    current_admin: Annotated[
        User,
        Depends(get_current_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    total_users = db.scalar(
        select(func.count())
        .select_from(User)
    ) or 0

    total_favourites = db.scalar(
        select(func.count())
        .select_from(Favorite)
    ) or 0

    total_watchlist_items = db.scalar(
        select(func.count())
        .select_from(Watchlist)
    ) or 0

    total_ratings = db.scalar(
        select(func.count())
        .select_from(Rating)
    ) or 0

    total_viewed_movies = db.scalar(
        select(func.count())
        .select_from(ViewHistory)
    ) or 0

    total_views = db.scalar(
        select(
            func.coalesce(
                func.sum(
                    ViewHistory.view_count
                ),
                0,
            )
        )
    ) or 0

    average_rating = db.scalar(
        select(
            func.avg(
                Rating.rating
            )
        )
    )

    return {
        "total_users": int(
            total_users
        ),
        "total_favourites": int(
            total_favourites
        ),
        "total_watchlist_items": int(
            total_watchlist_items
        ),
        "total_ratings": int(
            total_ratings
        ),
        "total_viewed_movies": int(
            total_viewed_movies
        ),
        "total_views": int(
            total_views
        ),
        "average_rating": (
            round(
                float(average_rating),
                2,
            )
            if average_rating is not None
            else None
        ),
    }

@router.get(
    "/movies/analytics",
    response_model=AdminMovieAnalyticsResponse,
)
def get_movie_analytics(
    current_admin: Annotated[
        User,
        Depends(get_current_admin),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    limit: int = 10,
):
    movie_stats = defaultdict(
        lambda: {
            "favourites": 0,
            "watchlist": 0,
            "ratings": 0,
            "views": 0,
        }
    )

    favourite_rows = db.execute(
        select(
            Favorite.movie_id,
            func.count(Favorite.id),
        )
        .group_by(Favorite.movie_id)
    ).all()

    for movie_id, count in favourite_rows:
        movie_stats[movie_id][
            "favourites"
        ] = int(count)


    watchlist_rows = db.execute(
        select(
            Watchlist.movie_id,
            func.count(Watchlist.id),
        )
        .group_by(Watchlist.movie_id)
    ).all()

    for movie_id, count in watchlist_rows:
        movie_stats[movie_id][
            "watchlist"
        ] = int(count)


    rating_rows = db.execute(
        select(
            Rating.movie_id,
            func.count(Rating.id),
        )
        .group_by(Rating.movie_id)
    ).all()

    for movie_id, count in rating_rows:
        movie_stats[movie_id][
            "ratings"
        ] = int(count)


    view_rows = db.execute(
        select(
            ViewHistory.movie_id,
            func.sum(
                ViewHistory.view_count
            ),
        )
        .group_by(ViewHistory.movie_id)
    ).all()

    for movie_id, count in view_rows:
        movie_stats[movie_id][
            "views"
        ] = int(count or 0)


    results = []

    for movie_id, stats in movie_stats.items():
        total_interactions = (
            stats["favourites"]
            + stats["watchlist"]
            + stats["ratings"]
            + stats["views"]
        )

        results.append(
            {
                "movie_id": int(movie_id),
                "favourites": stats[
                    "favourites"
                ],
                "watchlist": stats[
                    "watchlist"
                ],
                "ratings": stats[
                    "ratings"
                ],
                "views": stats[
                    "views"
                ],
                "total_interactions":
                    total_interactions,
            }
        )


    results.sort(
        key=lambda item:
            item["total_interactions"],
        reverse=True,
    )


    return {
        "results": results[:limit]
    }