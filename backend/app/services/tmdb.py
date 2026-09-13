import httpx

from app.config import settings


POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"


def get_tmdb_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.tmdb_read_access_token}",
        "accept": "application/json",
    }


def build_image_url(
    image_path: str | None,
    base_url: str,
) -> str | None:
    if not image_path:
        return None

    return f"{base_url}{image_path}"


def format_movie_summary(movie: dict) -> dict:
    return {
        "id": movie["id"],
        "title": movie.get("title", ""),
        "overview": movie.get("overview", ""),
        "poster_url": build_image_url(
            movie.get("poster_path"),
            POSTER_BASE_URL,
        ),
        "backdrop_url": build_image_url(
            movie.get("backdrop_path"),
            BACKDROP_BASE_URL,
        ),
        "release_date": movie.get("release_date") or None,
        "vote_average": movie.get("vote_average", 0.0),
        "vote_count": movie.get("vote_count", 0),
        "popularity": movie.get("popularity", 0.0),
        "original_language": movie.get(
            "original_language",
            "",
        ),
        "genre_ids": movie.get("genre_ids", []),
    }


def get_popular_movies(page: int = 1) -> dict:
    url = f"{settings.tmdb_base_url}/movie/popular"

    response = httpx.get(
        url,
        headers=get_tmdb_headers(),
        params={
            "language": "en-US",
            "page": page,
        },
        timeout=10.0,
    )

    response.raise_for_status()

    data = response.json()

    return {
        "page": data["page"],
        "total_pages": data["total_pages"],
        "total_results": data["total_results"],
        "results": [
            format_movie_summary(movie)
            for movie in data["results"]
        ],
    }