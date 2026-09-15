from collections import defaultdict
from functools import lru_cache
from pathlib import Path
import csv

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.rating import Rating
from app.models.view_history import ViewHistory
from app.services.neural_recommender import (
    load_embedding_store,
    normalize_vector,
)


ROOT_DIR = Path(__file__).resolve().parents[3]

METADATA_FILE = (
    ROOT_DIR
    / "ml"
    / "artifacts"
    / "serving"
    / "movie_embedding_metadata.csv"
)


NEURAL_WEIGHT = 0.75
CONTENT_WEIGHT = 0.25


@lru_cache
def load_genre_metadata():
    if not METADATA_FILE.exists():
        raise FileNotFoundError(
            "Movie embedding metadata was not found. "
            "Run ml/export_movie_embeddings.py first."
        )

    genres_by_tmdb: dict[int, set[str]] = {}

    with open(
        METADATA_FILE,
        "r",
        encoding="utf-8",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        for row in reader:
            tmdb_id = int(
                float(row["tmdbId"])
            )

            raw_genres = (
                row.get("genres")
                or ""
            )

            genres = {
                genre.strip()
                for genre in raw_genres.split("|")
                if genre.strip()
                and genre.strip()
                != "(no genres listed)"
            }

            genres_by_tmdb[
                tmdb_id
            ] = genres

    return genres_by_tmdb


def get_hybrid_recommendations(
    user_id: int,
    db: Session,
    limit: int = 12,
):
    (
        tmdb_ids,
        embeddings,
        tmdb_to_index,
    ) = load_embedding_store()

    genres_by_tmdb = (
        load_genre_metadata()
    )

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

    movie_weights: dict[int, float] = {}

    genre_weights: dict[str, float] = (
        defaultdict(float)
    )

    interacted_movie_ids: set[int] = set()

    # ---------------------------------
    # Favourites
    # Strong positive preference
    # ---------------------------------

    for favorite in favorites:
        movie_id = favorite.movie_id
        weight = 3.0

        interacted_movie_ids.add(
            movie_id
        )

        movie_weights[movie_id] = (
            movie_weights.get(
                movie_id,
                0.0,
            )
            + weight
        )

        for genre in genres_by_tmdb.get(
            movie_id,
            set(),
        ):
            genre_weights[
                genre
            ] += weight

    # ---------------------------------
    # Ratings
    # Positive and negative neural
    # signals.
    #
    # Only ratings above 3 contribute
    # positively to genre preferences.
    # ---------------------------------

    for rating in ratings:
        movie_id = rating.movie_id

        interacted_movie_ids.add(
            movie_id
        )

        rating_weight = (
            float(rating.rating) - 3.0
        ) * 2.0

        movie_weights[movie_id] = (
            movie_weights.get(
                movie_id,
                0.0,
            )
            + rating_weight
        )

        if rating_weight > 0:
            for genre in genres_by_tmdb.get(
                movie_id,
                set(),
            ):
                genre_weights[
                    genre
                ] += rating_weight

    # ---------------------------------
    # Viewing history
    # Weak positive signal
    # ---------------------------------

    for item in history:
        movie_id = item.movie_id

        interacted_movie_ids.add(
            movie_id
        )

        history_weight = (
            min(
                item.view_count,
                5,
            )
            * 0.25
        )

        movie_weights[movie_id] = (
            movie_weights.get(
                movie_id,
                0.0,
            )
            + history_weight
        )

        for genre in genres_by_tmdb.get(
            movie_id,
            set(),
        ):
            genre_weights[
                genre
            ] += history_weight

    # ---------------------------------
    # Build neural preference vector
    # ---------------------------------

    weighted_vectors = []
    used_weights = []

    for movie_id, weight in movie_weights.items():
        if abs(weight) < 1e-12:
            continue

        model_index = tmdb_to_index.get(
            movie_id
        )

        if model_index is None:
            continue

        weighted_vectors.append(
            embeddings[
                model_index
            ]
            * weight
        )

        used_weights.append(
            abs(weight)
        )

    if not weighted_vectors:
        return {
            "strategy":
                "hybrid_neural_content",
            "profile_interactions": 0,
            "top_genres": [],
            "results": [],
        }

    preference_vector = (
        np.sum(
            weighted_vectors,
            axis=0,
        )
        / sum(used_weights)
    )

    preference_vector = normalize_vector(
        preference_vector
    )

    if preference_vector is None:
        return {
            "strategy":
                "hybrid_neural_content",
            "profile_interactions": 0,
            "top_genres": [],
            "results": [],
        }

    # ---------------------------------
    # Neural similarity
    # ---------------------------------

    neural_scores = (
        embeddings
        @ preference_vector
    )

    # Cosine similarity ranges roughly
    # from -1 to 1.
    # Convert it to 0 to 1.
    normalized_neural_scores = np.clip(
        (
            neural_scores + 1.0
        ) / 2.0,
        0.0,
        1.0,
    )

    # ---------------------------------
    # Content / genre similarity
    # ---------------------------------

    content_scores = np.zeros(
        len(tmdb_ids),
        dtype=np.float32,
    )

    all_genres = sorted(
        genre_weights.keys()
    )

    if all_genres:
        user_genre_vector = np.array(
            [
                genre_weights.get(
                    genre,
                    0.0,
                )
                for genre in all_genres
            ],
            dtype=np.float32,
        )

        user_genre_norm = np.linalg.norm(
            user_genre_vector
        )

        if user_genre_norm > 0:
            for index, tmdb_id in enumerate(
                tmdb_ids
            ):
                candidate_genres = (
                    genres_by_tmdb.get(
                        int(tmdb_id),
                        set(),
                    )
                )

                if not candidate_genres:
                    continue

                candidate_vector = np.array(
                    [
                        1.0
                        if genre in candidate_genres
                        else 0.0
                        for genre in all_genres
                    ],
                    dtype=np.float32,
                )

                candidate_norm = np.linalg.norm(
                    candidate_vector
                )

                if candidate_norm == 0:
                    continue

                content_scores[index] = (
                    np.dot(
                        user_genre_vector,
                        candidate_vector,
                    )
                    / (
                        user_genre_norm
                        * candidate_norm
                    )
                )
            
    # ---------------------------------
    # Hybrid score
    # ---------------------------------

    hybrid_scores = (
        NEURAL_WEIGHT
        * normalized_neural_scores
        +
        CONTENT_WEIGHT
        * content_scores
    )

    # Never recommend movies the user
    # has already interacted with.
    for movie_id in interacted_movie_ids:
        model_index = (
            tmdb_to_index.get(
                movie_id
            )
        )

        if model_index is not None:
            hybrid_scores[
                model_index
            ] = -np.inf

    candidate_count = min(
        max(
            limit * 5,
            limit,
        ),
        len(tmdb_ids),
    )

    candidate_indices = np.argpartition(
        hybrid_scores,
        -candidate_count,
    )[-candidate_count:]

    candidate_indices = (
        candidate_indices[
            np.argsort(
                hybrid_scores[
                    candidate_indices
                ]
            )[::-1]
        ]
    )

    results = []

    for model_index in candidate_indices:
        hybrid_score = (
            hybrid_scores[
                model_index
            ]
        )

        if not np.isfinite(
            hybrid_score
        ):
            continue

        tmdb_id = int(
            tmdb_ids[
                model_index
            ]
        )

        candidate_genres = (
            genres_by_tmdb.get(
                tmdb_id,
                set(),
            )
        )

        matched_genres = sorted(
            [
                genre
                for genre
                in candidate_genres
                if genre_weights.get(
                    genre,
                    0.0,
                ) > 0
            ],
            key=lambda genre:
                genre_weights[
                    genre
                ],
            reverse=True,
        )

        results.append(
            {
                "tmdb_id": tmdb_id,
                "score": float(
                    hybrid_score
                ),
                "neural_score": float(
                    normalized_neural_scores[
                        model_index
                    ]
                ),
                "content_score": float(
                    content_scores[
                        model_index
                    ]
                ),
                "matched_genres":
                    matched_genres[:3],
            }
        )

        if len(results) >= limit:
            break

    top_genres = [
        genre
        for genre, _
        in sorted(
            genre_weights.items(),
            key=lambda item:
                item[1],
            reverse=True,
        )[:5]
    ]

    return {
        "strategy":
            "hybrid_neural_content",
        "profile_interactions":
            len(weighted_vectors),
        "top_genres": top_genres,
        "results": results,
    }