from pathlib import Path
import json

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, regularizers


ROOT_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = ROOT_DIR / "data" / "processed"

ARTIFACT_DIR = (
    ROOT_DIR
    / "ml"
    / "artifacts"
    / "neumf"
)

TRAIN_FILE = DATA_DIR / "train_ratings.csv"
VALIDATION_FILE = DATA_DIR / "validation_ratings.csv"
TEST_FILE = DATA_DIR / "test_ratings.csv"
FULL_RATINGS_FILE = DATA_DIR / "ratings_with_tmdb.csv"


SEED = 42
EMBEDDING_SIZE = 32
BATCH_SIZE = 256
EPOCHS = 30


np.random.seed(SEED)
tf.random.set_seed(SEED)


def build_id_mapping(values):
    unique_values = sorted(values.unique())

    return {
        int(value): index
        for index, value in enumerate(unique_values)
    }


def encode_data(
    data,
    user_to_index,
    movie_to_index,
):
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


def build_model(
    num_users,
    num_movies,
    global_mean,
):
    user_input = keras.Input(
        shape=(1,),
        dtype="int32",
        name="user_id",
    )

    movie_input = keras.Input(
        shape=(1,),
        dtype="int32",
        name="movie_id",
    )

    # ---------------------------------
    # GMF branch
    # ---------------------------------

    user_gmf = layers.Embedding(
        input_dim=num_users,
        output_dim=EMBEDDING_SIZE,
        embeddings_regularizer=regularizers.l2(
            1e-6
        ),
        name="user_gmf_embedding",
    )(user_input)

    movie_gmf = layers.Embedding(
        input_dim=num_movies,
        output_dim=EMBEDDING_SIZE,
        embeddings_regularizer=regularizers.l2(
            1e-6
        ),
        name="movie_gmf_embedding",
    )(movie_input)

    user_gmf = layers.Flatten()(
        user_gmf
    )

    movie_gmf = layers.Flatten()(
        movie_gmf
    )

    gmf_vector = layers.Multiply()(
        [
            user_gmf,
            movie_gmf,
        ]
    )

    # ---------------------------------
    # MLP branch
    # ---------------------------------

    user_mlp = layers.Embedding(
        input_dim=num_users,
        output_dim=EMBEDDING_SIZE,
        embeddings_regularizer=regularizers.l2(
            1e-6
        ),
        name="user_mlp_embedding",
    )(user_input)

    movie_mlp = layers.Embedding(
        input_dim=num_movies,
        output_dim=EMBEDDING_SIZE,
        embeddings_regularizer=regularizers.l2(
            1e-6
        ),
        name="movie_mlp_embedding",
    )(movie_input)

    user_mlp = layers.Flatten()(
        user_mlp
    )

    movie_mlp = layers.Flatten()(
        movie_mlp
    )

    mlp_vector = layers.Concatenate()(
        [
            user_mlp,
            movie_mlp,
        ]
    )

    mlp_vector = layers.Dense(
        128,
        activation="relu",
    )(mlp_vector)

    mlp_vector = layers.Dropout(
        0.15
    )(mlp_vector)

    mlp_vector = layers.Dense(
        64,
        activation="relu",
    )(mlp_vector)

    mlp_vector = layers.Dense(
        32,
        activation="relu",
    )(mlp_vector)

    # ---------------------------------
    # Combine GMF + MLP
    # ---------------------------------

    combined = layers.Concatenate()(
        [
            gmf_vector,
            mlp_vector,
        ]
    )

    interaction_score = layers.Dense(
        1,
        activation="linear",
        bias_initializer=keras.initializers.Constant(
            global_mean
        ),
        name="interaction_score",
    )(combined)

    # ---------------------------------
    # User/movie bias terms
    # ---------------------------------

    user_bias = layers.Embedding(
        input_dim=num_users,
        output_dim=1,
        embeddings_initializer="zeros",
        name="user_bias",
    )(user_input)

    user_bias = layers.Flatten()(
        user_bias
    )

    movie_bias = layers.Embedding(
        input_dim=num_movies,
        output_dim=1,
        embeddings_initializer="zeros",
        name="movie_bias",
    )(movie_input)

    movie_bias = layers.Flatten()(
        movie_bias
    )

    output = layers.Add(
        name="predicted_rating"
    )(
        [
            interaction_score,
            user_bias,
            movie_bias,
        ]
    )

    model = keras.Model(
        inputs=[
            user_input,
            movie_input,
        ],
        outputs=output,
        name="neumf_recommender",
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


def calculate_metrics(
    actual,
    predicted,
):
    predicted = np.clip(
        predicted,
        0.5,
        5.0,
    )

    errors = actual - predicted

    mae = np.mean(
        np.abs(errors)
    )

    mse = np.mean(
        np.square(errors)
    )

    rmse = np.sqrt(mse)

    return mse, mae, rmse


def main():
    print("Loading datasets...")

    train = pd.read_csv(TRAIN_FILE)

    validation = pd.read_csv(
        VALIDATION_FILE
    )

    test = pd.read_csv(TEST_FILE)

    full_ratings = pd.read_csv(
        FULL_RATINGS_FILE
    )

    user_to_index = build_id_mapping(
        full_ratings["userId"]
    )

    movie_to_index = build_id_mapping(
        full_ratings["movieId"]
    )

    num_users = len(user_to_index)
    num_movies = len(movie_to_index)

    global_mean = float(
        train["rating"].mean()
    )

    print()
    print("Model vocabulary")
    print("----------------")
    print(f"Users:       {num_users:,}")
    print(f"Movies:      {num_movies:,}")
    print(
        f"Global mean: {global_mean:.4f}"
    )

    (
        train_users,
        train_movies,
        train_ratings,
    ) = encode_data(
        train,
        user_to_index,
        movie_to_index,
    )

    (
        validation_users,
        validation_movies,
        validation_ratings,
    ) = encode_data(
        validation,
        user_to_index,
        movie_to_index,
    )

    (
        test_users,
        test_movies,
        test_ratings,
    ) = encode_data(
        test,
        user_to_index,
        movie_to_index,
    )

    model = build_model(
        num_users=num_users,
        num_movies=num_movies,
        global_mean=global_mean,
    )

    print()
    model.summary()

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_rmse",
            patience=4,
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
    print("Training NeuMF model...")
    print()

    history = model.fit(
        {
            "user_id": train_users,
            "movie_id": train_movies,
        },
        train_ratings,
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

    predictions = model.predict(
        {
            "user_id": test_users,
            "movie_id": test_movies,
        },
        verbose=0,
    ).flatten()

    clipped_predictions = np.clip(
        predictions,
        0.5,
        5.0,
    )

    mse, mae, rmse = calculate_metrics(
        test_ratings,
        clipped_predictions,
    )

    print()
    print("NeuMF Test results")
    print("------------------")
    print(f"MSE:  {mse:.4f}")
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")

    print()
    print("Sample predictions")
    print("------------------")

    for index in range(
        min(10, len(test_ratings))
    ):
        print(
            f"Actual: "
            f"{test_ratings[index]:.1f} | "
            f"Predicted: "
            f"{clipped_predictions[index]:.2f}"
        )

    ARTIFACT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    model.save(
        ARTIFACT_DIR
        / "neumf_model.keras"
    )

    with open(
        ARTIFACT_DIR
        / "user_to_index.json",
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
        ARTIFACT_DIR
        / "movie_to_index.json",
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

    pd.DataFrame(
        history.history
    ).to_csv(
        ARTIFACT_DIR
        / "training_history.csv",
        index=False,
    )

    metrics = {
        "mse": float(mse),
        "mae": float(mae),
        "rmse": float(rmse),
    }

    with open(
        ARTIFACT_DIR
        / "test_metrics.json",
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            metrics,
            file,
            indent=2,
        )

    print()
    print("Model saved to:")
    print(
        ARTIFACT_DIR
        / "neumf_model.keras"
    )


if __name__ == "__main__":
    main()