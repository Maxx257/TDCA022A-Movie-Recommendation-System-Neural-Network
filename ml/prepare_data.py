from pathlib import Path

import pandas as pd


ROOT_DIR = Path(__file__).resolve().parent.parent

RAW_DATA_DIR = (
    ROOT_DIR
    / "data"
    / "raw"
    / "ml-latest-small"
)

PROCESSED_DATA_DIR = (
    ROOT_DIR
    / "data"
    / "processed"
)


def main():
    ratings_path = RAW_DATA_DIR / "ratings.csv"
    movies_path = RAW_DATA_DIR / "movies.csv"
    links_path = RAW_DATA_DIR / "links.csv"

    print("Loading MovieLens data...")

    ratings = pd.read_csv(ratings_path)
    movies = pd.read_csv(movies_path)
    links = pd.read_csv(links_path)

    print()
    print("Original dataset")
    print("----------------")
    print(f"Ratings: {len(ratings):,}")
    print(f"Users: {ratings['userId'].nunique():,}")
    print(
        f"Movies in ratings: "
        f"{ratings['movieId'].nunique():,}"
    )
    print(f"Movies metadata: {len(movies):,}")
    print(f"Link records: {len(links):,}")

    missing_tmdb = links["tmdbId"].isna().sum()

    print(f"Missing TMDB IDs: {missing_tmdb:,}")

    clean_links = links.dropna(
        subset=["tmdbId"]
    ).copy()

    clean_links["tmdbId"] = (
        clean_links["tmdbId"].astype(int)
    )

    ratings_with_tmdb = ratings.merge(
        clean_links[
            [
                "movieId",
                "tmdbId",
            ]
        ],
        on="movieId",
        how="inner",
    )

    movies_with_tmdb = movies.merge(
        clean_links[
            [
                "movieId",
                "tmdbId",
            ]
        ],
        on="movieId",
        how="inner",
    )

    print()
    print("After TMDB mapping")
    print("------------------")
    print(
        f"Ratings: "
        f"{len(ratings_with_tmdb):,}"
    )
    print(
        f"Users: "
        f"{ratings_with_tmdb['userId'].nunique():,}"
    )
    print(
        f"Movies: "
        f"{ratings_with_tmdb['movieId'].nunique():,}"
    )

    removed_ratings = (
        len(ratings)
        - len(ratings_with_tmdb)
    )

    print(
        "Ratings removed because of missing "
        f"TMDB mapping: {removed_ratings:,}"
    )

    print()
    print("Rating distribution")
    print("-------------------")
    print(
        ratings_with_tmdb["rating"]
        .value_counts()
        .sort_index()
    )

    PROCESSED_DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    ratings_output = (
        PROCESSED_DATA_DIR
        / "ratings_with_tmdb.csv"
    )

    movies_output = (
        PROCESSED_DATA_DIR
        / "movies_with_tmdb.csv"
    )

    ratings_with_tmdb.to_csv(
        ratings_output,
        index=False,
    )

    movies_with_tmdb.to_csv(
        movies_output,
        index=False,
    )

    print()
    print("Processed files created:")
    print(ratings_output)
    print(movies_output)

    print()
    print("Sample rating:")
    print(ratings_with_tmdb.head())

    print()
    print("Sample movie mapping:")
    print(movies_with_tmdb.head())


if __name__ == "__main__":
    main()