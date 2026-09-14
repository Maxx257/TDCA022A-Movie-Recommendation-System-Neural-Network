from pathlib import Path
import json

import numpy as np
import pandas as pd
from tensorflow import keras


ROOT_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = ROOT_DIR / "data" / "processed"
ARTIFACT_DIR = ROOT_DIR / "ml" / "artifacts"

TRAIN_FILE = DATA_DIR / "train_ratings.csv"
VALIDATION_FILE = DATA_DIR / "validation_ratings.csv"
TEST_FILE = DATA_DIR / "test_ratings.csv"
FULL_FILE = DATA_DIR / "ratings_with_tmdb.csv"

TOP_K = 10
NEGATIVE_SAMPLES = 99
SEED = 42


def load_mapping(path):
    with open(
        path,
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    return {
        int(key): int(value)
        for key, value in data.items()
    }


def evaluate_model(
    name,
    model_path,
    user_mapping_path,
    movie_mapping_path,
    train,
    validation,
    test,
    full_ratings,
):
    print()
    print(f"Evaluating {name}...")
    print("-" * (11 + len(name)))

    model = keras.models.load_model(
        model_path
    )

    user_to_index = load_mapping(
        user_mapping_path
    )

    movie_to_index = load_mapping(
        movie_mapping_path
    )

    all_movie_ids = set(
        full_ratings["movieId"]
        .astype(int)
        .unique()
        .tolist()
    )

    train_seen = (
        train.groupby("userId")["movieId"]
        .apply(set)
        .to_dict()
    )

    validation_seen = (
        validation.groupby("userId")["movieId"]
        .apply(set)
        .to_dict()
    )

    # A test movie is treated as relevant only
    # when the user rated it 4.0 or higher.
    positive_test = test[
        test["rating"] >= 4.0
    ].copy()

    rng = np.random.default_rng(
        SEED
    )

    hits = []
    ndcgs = []
    reciprocal_ranks = []

    evaluated_users = 0

    for _, row in positive_test.iterrows():
        user_id = int(
            row["userId"]
        )

        positive_movie_id = int(
            row["movieId"]
        )

        if user_id not in user_to_index:
            continue

        if (
            positive_movie_id
            not in movie_to_index
        ):
            continue

        seen_movies = set(
            train_seen.get(
                user_id,
                set(),
            )
        )

        seen_movies.update(
            validation_seen.get(
                user_id,
                set(),
            )
        )

        seen_movies.add(
            positive_movie_id
        )

        negative_pool = np.array(
            list(
                all_movie_ids
                - seen_movies
            ),
            dtype=np.int32,
        )

        sample_size = min(
            NEGATIVE_SAMPLES,
            len(negative_pool),
        )

        negative_movies = rng.choice(
            negative_pool,
            size=sample_size,
            replace=False,
        )

        candidate_movie_ids = np.concatenate(
            (
                np.array(
                    [positive_movie_id],
                    dtype=np.int32,
                ),
                negative_movies,
            )
        )

        candidate_movie_indices = np.array(
            [
                movie_to_index[
                    int(movie_id)
                ]
                for movie_id
                in candidate_movie_ids
            ],
            dtype=np.int32,
        ).reshape(-1, 1)

        user_index = user_to_index[
            user_id
        ]

        user_indices = np.full(
            (
                len(
                    candidate_movie_indices
                ),
                1,
            ),
            user_index,
            dtype=np.int32,
        )

        scores = model(
            {
                "user_id": user_indices,
                "movie_id":
                    candidate_movie_indices,
            },
            training=False,
        ).numpy().reshape(-1)

        ranking = np.argsort(
            -scores
        )

        # Positive movie is candidate index 0.
        positive_rank = int(
            np.where(
                ranking == 0
            )[0][0]
        ) + 1

        evaluated_users += 1

        if positive_rank <= TOP_K:
            hits.append(1.0)

            ndcgs.append(
                1.0
                / np.log2(
                    positive_rank + 1
                )
            )

            reciprocal_ranks.append(
                1.0
                / positive_rank
            )
        else:
            hits.append(0.0)
            ndcgs.append(0.0)
            reciprocal_ranks.append(0.0)

    hit_rate = float(
        np.mean(hits)
    )

    ndcg = float(
        np.mean(ndcgs)
    )

    mrr = float(
        np.mean(reciprocal_ranks)
    )

    print(
        f"Users evaluated: "
        f"{evaluated_users}"
    )

    print(
        f"Hit Rate@{TOP_K}: "
        f"{hit_rate:.4f}"
    )

    print(
        f"NDCG@{TOP_K}: "
        f"{ndcg:.4f}"
    )

    print(
        f"MRR@{TOP_K}: "
        f"{mrr:.4f}"
    )

    return {
        "model": name,
        "users": evaluated_users,
        "hit_rate": hit_rate,
        "ndcg": ndcg,
        "mrr": mrr,
    }


def main():
    print(
        "Loading ranking evaluation data..."
    )

    train = pd.read_csv(
        TRAIN_FILE
    )

    validation = pd.read_csv(
        VALIDATION_FILE
    )

    test = pd.read_csv(
        TEST_FILE
    )

    full_ratings = pd.read_csv(
        FULL_FILE
    )

    print()
    print(
        "Positive test interactions "
        "(rating >= 4.0): "
        f"{len(test[test['rating'] >= 4.0])}"
    )

    ncf_results = evaluate_model(
        name="NCF V1",
        model_path=(
            ARTIFACT_DIR
            / "ncf_model.keras"
        ),
        user_mapping_path=(
            ARTIFACT_DIR
            / "user_to_index.json"
        ),
        movie_mapping_path=(
            ARTIFACT_DIR
            / "movie_to_index.json"
        ),
        train=train,
        validation=validation,
        test=test,
        full_ratings=full_ratings,
    )

    neumf_dir = (
        ARTIFACT_DIR / "neumf"
    )

    neumf_results = evaluate_model(
        name="NeuMF V2",
        model_path=(
            neumf_dir
            / "neumf_model.keras"
        ),
        user_mapping_path=(
            neumf_dir
            / "user_to_index.json"
        ),
        movie_mapping_path=(
            neumf_dir
            / "movie_to_index.json"
        ),
        train=train,
        validation=validation,
        test=test,
        full_ratings=full_ratings,
    )

    print()
    print("Final Top-K comparison")
    print("----------------------")

    for result in [
        ncf_results,
        neumf_results,
    ]:
        print(
            f"{result['model']:<10} "
            f"HR@10: "
            f"{result['hit_rate']:.4f}   "
            f"NDCG@10: "
            f"{result['ndcg']:.4f}   "
            f"MRR@10: "
            f"{result['mrr']:.4f}"
        )


if __name__ == "__main__":
    main()