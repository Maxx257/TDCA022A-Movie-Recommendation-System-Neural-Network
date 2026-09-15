from functools import lru_cache
from pathlib import Path

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.rating import Rating
from app.models.view_history import ViewHistory


ROOT_DIR = Path(__file__).resolve().parents[3]

EMBEDDING_FILE = (
    ROOT_DIR
    / "ml"
    / "artifacts"
    / "serving"
    / "movie_embeddings.npz"
)


@lru_cache
def load_embedding_store():
    if not EMBEDDING_FILE.exists():
        raise FileNotFoundError(
            "Neural movie embeddings were not found. "
            "Run ml/export_movie_embeddings.py first."
        )

    data = np.load(
        EMBEDDING_FILE,
        allow_pickle=False,
    )

    tmdb_ids = data[
        "tmdb_ids"
    ].astype(np.int32)

    embeddings = data[
        "embeddings"
    ].astype(np.float32)

    tmdb_to_index = {
        int(tmdb_id): index
        for index, tmdb_id in enumerate(tmdb_ids)
    }

    return (
        tmdb_ids,
        embeddings,
        tmdb_to_index,
    )


def normalize_vector(vector):
    norm = np.linalg.norm(vector)

    if norm < 1e-12:
        return None

    return vector / norm


def get_neural_recommendations(
    user_id: int,
    db: Session,
    limit: int = 12,
):
    (
        tmdb_ids,
        embeddings,
        tmdb_to_index,
    ) = load_embedding_store()

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

    interacted_movie_ids: set[int] = set()

    # Favourites = strong positive signal
    for favorite in favorites:
        movie_id = favorite.movie_id

        interacted_movie_ids.add(
            movie_id
        )

        movie_weights[movie_id] = (
            movie_weights.get(
                movie_id,
                0.0,
            )
            + 3.0
        )

    # Ratings:
    # > 3 = positive
    # < 3 = negative
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

    # History = weak positive signal
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

    weighted_vectors = []
    used_weights = []

    for movie_id, weight in movie_weights.items():
        if abs(weight) < 1e-12:
            continue

        model_index = tmdb_to_index.get(
            movie_id
        )

        # Some newer TMDB movies may not exist
        # in the MovieLens dataset.
        if model_index is None:
            continue

        weighted_vectors.append(
            embeddings[model_index]
            * weight
        )

        used_weights.append(
            abs(weight)
        )

    if not weighted_vectors:
        return {
            "strategy": "neural_movie_embeddings",
            "profile_interactions": 0,
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
            "strategy": "neural_movie_embeddings",
            "profile_interactions": 0,
            "results": [],
        }

    # Exported embeddings are normalized,
    # so dot product works as cosine similarity.
    similarity_scores = (
        embeddings @ preference_vector
    )

    # Remove movies already interacted with.
    for movie_id in interacted_movie_ids:
        model_index = tmdb_to_index.get(
            movie_id
        )

        if model_index is not None:
            similarity_scores[
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
        similarity_scores,
        -candidate_count,
    )[-candidate_count:]

    candidate_indices = candidate_indices[
        np.argsort(
            similarity_scores[
                candidate_indices
            ]
        )[::-1]
    ]

    results = []

    for model_index in candidate_indices:
        score = similarity_scores[
            model_index
        ]

        if not np.isfinite(score):
            continue

        results.append(
            {
                "tmdb_id": int(
                    tmdb_ids[
                        model_index
                    ]
                ),
                "score": float(score),
            }
        )

        if len(results) >= limit:
            break

    return {
        "strategy": "neural_movie_embeddings",
        "profile_interactions": len(
            weighted_vectors
        ),
        "results": results,
    }