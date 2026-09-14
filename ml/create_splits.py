from pathlib import Path

import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    ROOT_DIR
    / "data"
    / "processed"
    / "ratings_with_tmdb.csv"
)

OUTPUT_DIR = (
    ROOT_DIR
    / "data"
    / "processed"
)


def main():
    print("Loading processed ratings...")

    ratings = pd.read_csv(INPUT_FILE)

    ratings = ratings.sort_values(
        ["userId", "timestamp"]
    ).reset_index(drop=True)

    train_parts = []
    validation_parts = []
    test_parts = []

    for _, user_ratings in ratings.groupby("userId"):
        user_ratings = user_ratings.sort_values(
            "timestamp"
        )

        # Latest rating → test
        test_parts.append(
            user_ratings.iloc[[-1]]
        )

        # Second latest rating → validation
        validation_parts.append(
            user_ratings.iloc[[-2]]
        )

        # Everything before that → training
        train_parts.append(
            user_ratings.iloc[:-2]
        )

    train = pd.concat(
        train_parts,
        ignore_index=True,
    )

    validation = pd.concat(
        validation_parts,
        ignore_index=True,
    )

    test = pd.concat(
        test_parts,
        ignore_index=True,
    )

    print()
    print("Dataset split")
    print("-------------")
    print(f"Training ratings:   {len(train):,}")
    print(f"Validation ratings: {len(validation):,}")
    print(f"Test ratings:       {len(test):,}")

    print()
    print("Users")
    print("-----")
    print(
        f"Training users:   "
        f"{train['userId'].nunique():,}"
    )
    print(
        f"Validation users: "
        f"{validation['userId'].nunique():,}"
    )
    print(
        f"Test users:       "
        f"{test['userId'].nunique():,}"
    )

    train.to_csv(
        OUTPUT_DIR / "train_ratings.csv",
        index=False,
    )

    validation.to_csv(
        OUTPUT_DIR / "validation_ratings.csv",
        index=False,
    )

    test.to_csv(
        OUTPUT_DIR / "test_ratings.csv",
        index=False,
    )

    print()
    print("Created:")
    print("train_ratings.csv")
    print("validation_ratings.csv")
    print("test_ratings.csv")


if __name__ == "__main__":
    main()