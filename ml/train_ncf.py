from pathlib import Path
import json

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


ROOT_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = ROOT_DIR / "data" / "processed"

ARTIFACT_DIR = ROOT_DIR / "ml" / "artifacts"

TRAIN_FILE = DATA_DIR / "train_ratings.csv"
VALIDATION_FILE = DATA_DIR / "validation_ratings.csv"
TEST_FILE = DATA_DIR / "test_ratings.csv"
FULL_RATINGS_FILE = DATA_DIR / "ratings_with_tmdb.csv"


SEED = 42
EMBEDDING_SIZE = 32
BATCH_SIZE = 256
EPOCHS = 20


np.random.seed(SEED)
tf.random.set_seed(SEED)


def build_id_mapping(values):
    unique_values = sorted(values.unique())

    return {
        int(value): index
        for index, value in enumerate(unique_values)
    }


def encode_data(data, user_to_index, movie_to_index):
    users = (
        data["userId"]
        .map(user_to_index)
        .to_numpy(dtype=np.int32)
        .reshape(-1, 1)
    )

    movies = (
        data["movieId"]
        .map(movie_to_index)
        .to_numpy(dtype=np.int32)
        .reshape(-1, 1)
    )

    ratings = (
        data["rating"]
        .to_numpy(dtype=np.float32)
    )

    return users, movies, ratings


def build_model(num_users, num_movies):
    user_input = keras.Input(
        shape=(1,),
        name="user_id",
        dtype="int32",
    )

    movie_input = keras.Input(
        shape=(1,),
        name="movie_id",
        dtype="int32",
    )

    user_embedding = layers.Embedding(
        input_dim=num_users,
        output_dim=EMBEDDING_SIZE,
        name="user_embedding",
    )(user_input)

    movie_embedding = layers.Embedding(
        input_dim=num_movies,
        output_dim=EMBEDDING_SIZE,
        name="movie_embedding",
    )(movie_input)

    user_vector = layers.Flatten()(
        user_embedding
    )

    movie_vector = layers.Flatten()(
        movie_embedding
    )

    x = layers.Concatenate()(
        [
            user_vector,
            movie_vector,
        ]
    )

    x = layers.Dense(
        128,
        activation="relu",
    )(x)

    x = layers.Dropout(
        0.2
    )(x)

    x = layers.Dense(
        64,
        activation="relu",
    )(x)

    x = layers.Dense(
        32,
        activation="relu",
    )(x)

    raw_output = layers.Dense(
        1,
        activation="sigmoid",
    )(x)

    rating_output = layers.Rescaling(
        scale=4.5,
        offset=0.5,
        name="predicted_rating",
    )(raw_output)

    model = keras.Model(
        inputs=[
            user_input,
            movie_input,
        ],
        outputs=rating_output,
        name="neural_collaborative_filtering",
    )

    model.compile(
        optimizer=keras.optimizers.Adam(
            learning_rate=0.001
        ),
        loss="mse",
        metrics=[
            keras.metrics.MeanAbsoluteError(
                name="mae"
            ),
            keras.metrics.RootMeanSquaredError(
                name="rmse"
            ),
        ],
    )

    return model


def main():
    print("Loading datasets...")

    train = pd.read_csv(TRAIN_FILE)
    validation = pd.read_csv(VALIDATION_FILE)
    test = pd.read_csv(TEST_FILE)
    full_ratings = pd.read_csv(FULL_RATINGS_FILE)

    user_to_index = build_id_mapping(
        full_ratings["userId"]
    )

    movie_to_index = build_id_mapping(
        full_ratings["movieId"]
    )

    num_users = len(user_to_index)
    num_movies = len(movie_to_index)

    print()
    print("Model vocabulary")
    print("----------------")
    print(f"Users:  {num_users:,}")
    print(f"Movies: {num_movies:,}")

    train_users, train_movies, train_ratings = (
        encode_data(
            train,
            user_to_index,
            movie_to_index,
        )
    )

    validation_users, validation_movies, validation_ratings = (
        encode_data(
            validation,
            user_to_index,
            movie_to_index,
        )
    )

    test_users, test_movies, test_ratings = (
        encode_data(
            test,
            user_to_index,
            movie_to_index,
        )
    )

    model = build_model(
        num_users=num_users,
        num_movies=num_movies,
    )

    print()
    model.summary()

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_rmse",
            patience=3,
            restore_best_weights=True,
            mode="min",
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_rmse",
            factor=0.5,
            patience=2,
            min_lr=0.00001,
            mode="min",
        ),
    ]

    print()
    print("Training neural recommender...")
    print()

    history = model.fit(
        x={
            "user_id": train_users,
            "movie_id": train_movies,
        },
        y=train_ratings,
        validation_data=(
            {
                "user_id": validation_users,
                "movie_id": validation_movies,
            },
            validation_ratings,
        ),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    )

    print()
    print("Evaluating test data...")
    print()

    test_results = model.evaluate(
        {
            "user_id": test_users,
            "movie_id": test_movies,
        },
        test_ratings,
        verbose=0,
        return_dict=True,
    )

    print("Test results")
    print("------------")
    print(
        f"MSE:  {test_results['loss']:.4f}"
    )
    print(
        f"MAE:  {test_results['mae']:.4f}"
    )
    print(
        f"RMSE: {test_results['rmse']:.4f}"
    )

    predictions = model.predict(
        {
            "user_id": test_users[:10],
            "movie_id": test_movies[:10],
        },
        verbose=0,
    ).flatten()

    print()
    print("Sample predictions")
    print("------------------")

    for index in range(
        min(10, len(predictions))
    ):
        print(
            f"Actual: {test_ratings[index]:.1f} | "
            f"Predicted: {predictions[index]:.2f}"
        )

    ARTIFACT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model.save(
        ARTIFACT_DIR / "ncf_model.keras"
    )

    with open(
        ARTIFACT_DIR / "user_to_index.json",
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            {
                str(key): int(value)
                for key, value
                in user_to_index.items()
            },
            file,
        )

    with open(
        ARTIFACT_DIR / "movie_to_index.json",
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            {
                str(key): int(value)
                for key, value
                in movie_to_index.items()
            },
            file,
        )

    history_dataframe = pd.DataFrame(
        history.history
    )

    history_dataframe.to_csv(
        ARTIFACT_DIR
        / "training_history.csv",
        index=False,
    )

    metrics = {
        key: float(value)
        for key, value in test_results.items()
    }

    with open(
        ARTIFACT_DIR / "test_metrics.json",
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            metrics,
            file,
            indent=2,
        )

    print()
    print("Saved model artifacts:")
    print(ARTIFACT_DIR / "ncf_model.keras")
    print(
        ARTIFACT_DIR
        / "user_to_index.json"
    )
    print(
        ARTIFACT_DIR
        / "movie_to_index.json"
    )
    print(
        ARTIFACT_DIR
        / "training_history.csv"
    )
    print(
        ARTIFACT_DIR
        / "test_metrics.json"
    )


if __name__ == "__main__":
    main()