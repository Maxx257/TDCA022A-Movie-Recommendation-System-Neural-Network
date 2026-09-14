from pathlib import Path

import numpy as np
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = (
    ROOT_DIR
    / "data"
    / "processed"
)

TRAIN_FILE = DATA_DIR / "train_ratings.csv"
TEST_FILE = DATA_DIR / "test_ratings.csv"


def calculate_metrics(
    actual,
    predicted,
):
    actual = np.asarray(
        actual,
        dtype=np.float32,
    )

    predicted = np.asarray(
        predicted,
        dtype=np.float32,
    )

    errors = actual - predicted

    mae = np.mean(
        np.abs(errors)
    )

    rmse = np.sqrt(
        np.mean(
            np.square(errors)
        )
    )

    return mae, rmse


def print_result(
    name,
    actual,
    predicted,
):
    mae, rmse = calculate_metrics(
        actual,
        predicted,
    )

    print(
        f"{name:<25} "
        f"MAE: {mae:.4f}   "
        f"RMSE: {rmse:.4f}"
    )


def main():
    print("Loading training and test data...")

    train = pd.read_csv(
        TRAIN_FILE
    )

    test = pd.read_csv(
        TEST_FILE
    )

    actual = test["rating"].to_numpy()

    global_mean = (
        train["rating"].mean()
    )

    print()
    print(
        f"Training global mean rating: "
        f"{global_mean:.4f}"
    )

    print()
    print("Baseline results")
    print("----------------")

    # Baseline 1:
    # Predict the same global average
    # for every user/movie.
    global_predictions = np.full(
        len(test),
        global_mean,
    )

    print_result(
        "Global mean",
        actual,
        global_predictions,
    )

    # Baseline 2:
    # Predict each user's average rating.
    user_means = (
        train.groupby("userId")["rating"]
        .mean()
    )

    user_predictions = (
        test["userId"]
        .map(user_means)
        .fillna(global_mean)
        .to_numpy()
    )

    print_result(
        "User mean",
        actual,
        user_predictions,
    )

    # Baseline 3:
    # Predict each movie's average rating.
    movie_means = (
        train.groupby("movieId")["rating"]
        .mean()
    )

    movie_predictions = (
        test["movieId"]
        .map(movie_means)
        .fillna(global_mean)
        .to_numpy()
    )

    print_result(
        "Movie mean",
        actual,
        movie_predictions,
    )

    # Baseline 4:
    # Simple combination of user
    # preference and movie popularity.
    combined_predictions = (
        user_predictions
        + movie_predictions
    ) / 2

    print_result(
        "User + movie mean",
        actual,
        combined_predictions,
    )

    print()
    print("Your neural model")
    print("-----------------")
    print(
        "Neural Collaborative "
        "Filtering       "
        "MAE: 0.7617   RMSE: 0.9868"
    )


if __name__ == "__main__":
    main()