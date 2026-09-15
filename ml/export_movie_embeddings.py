from pathlib import Path
import json

import numpy as np
import pandas as pd
from tensorflow import keras


ROOT_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = (
    ROOT_DIR
    / "ml"
    / "artifacts"
    / "neumf"
)

MODEL_PATH = (
    MODEL_DIR
    / "neumf_model.keras"
)

MOVIE_MAPPING_PATH = (
    MODEL_DIR
    / "movie_to_index.json"
)

MOVIES_FILE = (
    ROOT_DIR
    / "data"
    / "processed"
    / "movies_with_tmdb.csv"
)

OUTPUT_DIR = (
    ROOT_DIR
    / "ml"
    / "artifacts"
    / "serving"
)


def load_movie_mapping():
    with open(
        MOVIE_MAPPING_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        raw_mapping = json.load(file)

    return {
        int(movie_id): int(index)
        for movie_id, index
        in raw_mapping.items()
    }


def normalize_embeddings(embeddings):
    norms = np.linalg.norm(
        embeddings,
        axis=1,
        keepdims=True,
    )

    norms = np.maximum(
        norms,
        1e-12,
    )

    return embeddings / norms


def main():
    print("Loading NeuMF model...")

    model = keras.models.load_model(
        MODEL_PATH,
        compile=False,
    )

    movie_to_index = load_movie_mapping()

    movies = pd.read_csv(
        MOVIES_FILE
    )

    movies["movieId"] = (
        movies["movieId"]
        .astype(int)
    )

    movies["tmdbId"] = (
        movies["tmdbId"]
        .astype(int)
    )

    movie_metadata = (
        movies
        .drop_duplicates("movieId")
        .set_index("movieId")
    )

    print(
        "Extracting learned movie embeddings..."
    )

    gmf_embeddings = (
        model
        .get_layer(
            "movie_gmf_embedding"
        )
        .get_weights()[0]
    )

    mlp_embeddings = (
        model
        .get_layer(
            "movie_mlp_embedding"
        )
        .get_weights()[0]
    )

    # Combine both learned movie
    # representations from NeuMF.
    combined_embeddings = np.concatenate(
        [
            gmf_embeddings,
            mlp_embeddings,
        ],
        axis=1,
    ).astype(np.float32)

    combined_embeddings = (
        normalize_embeddings(
            combined_embeddings
        )
    )

    movie_ids = []
    tmdb_ids = []
    titles = []
    genres = []
    exported_embeddings = []

    sorted_mapping = sorted(
        movie_to_index.items(),
        key=lambda item: item[1],
    )

    for movie_id, model_index in sorted_mapping:
        if movie_id not in movie_metadata.index:
            continue

        metadata = movie_metadata.loc[
            movie_id
        ]

        movie_ids.append(
            movie_id
        )

        tmdb_ids.append(
            int(metadata["tmdbId"])
        )

        titles.append(
            metadata["title"]
        )

        genres.append(
            metadata["genres"]
        )

        exported_embeddings.append(
            combined_embeddings[
                model_index
            ]
        )

    embedding_matrix = np.stack(
        exported_embeddings
    ).astype(np.float32)

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    np.savez_compressed(
        OUTPUT_DIR
        / "movie_embeddings.npz",
        movie_ids=np.array(
            movie_ids,
            dtype=np.int32,
        ),
        tmdb_ids=np.array(
            tmdb_ids,
            dtype=np.int32,
        ),
        embeddings=embedding_matrix,
    )

    metadata_output = pd.DataFrame(
        {
            "movieId": movie_ids,
            "tmdbId": tmdb_ids,
            "title": titles,
            "genres": genres,
        }
    )

    metadata_output.to_csv(
        OUTPUT_DIR
        / "movie_embedding_metadata.csv",
        index=False,
    )

    print()
    print("Export complete")
    print("---------------")

    print(
        f"Movies exported: "
        f"{len(movie_ids):,}"
    )

    print(
        "Embedding dimensions: "
        f"{embedding_matrix.shape}"
    )

    print()
    print("Created:")
    print(
        OUTPUT_DIR
        / "movie_embeddings.npz"
    )

    print(
        OUTPUT_DIR
        / "movie_embedding_metadata.csv"
    )

    print()
    print("Sample mappings:")
    print(
        metadata_output.head()
    )


if __name__ == "__main__":
    main()