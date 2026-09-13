import httpx

from app.config import settings


POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"
PROFILE_BASE_URL = "https://image.tmdb.org/t/p/w185"


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

def search_movies(
    query: str,
    page: int = 1,
) -> dict:
    url = f"{settings.tmdb_base_url}/search/movie"

    response = httpx.get(
        url,
        headers=get_tmdb_headers(),
        params={
            "query": query,
            "language": "en-US",
            "page": page,
            "include_adult": False,
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

def format_cast_member(cast_member: dict) -> dict:
    return {
        "id": cast_member["id"],
        "name": cast_member.get("name", ""),
        "character": cast_member.get("character", ""),
        "profile_url": build_image_url(
            cast_member.get("profile_path"),
            PROFILE_BASE_URL,
        ),
    }


def get_movie_details(movie_id: int) -> dict:
    url = f"{settings.tmdb_base_url}/movie/{movie_id}"

    response = httpx.get(
        url,
        headers=get_tmdb_headers(),
        params={
            "language": "en-US",
            "append_to_response": "credits",
        },
        timeout=10.0,
    )

    response.raise_for_status()

    movie = response.json()

    cast = movie.get("credits", {}).get("cast", [])

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
        "runtime": movie.get("runtime"),
        "original_language": movie.get(
            "original_language",
            "",
        ),
        "genres": [
            genre["name"]
            for genre in movie.get("genres", [])
        ],
        "cast": [
            format_cast_member(member)
            for member in cast[:10]
        ],
    }

def get_movie_genres() -> dict:
    url = f"{settings.tmdb_base_url}/genre/movie/list"

    response = httpx.get(
        url,
        headers=get_tmdb_headers(),
        params={
            "language": "en-US",
        },
        timeout=10.0,
    )

    response.raise_for_status()

    return response.json()


def discover_movies(
    page: int = 1,
    genre_id: int | None = None,
) -> dict:
    url = f"{settings.tmdb_base_url}/discover/movie"

    params = {
        "language": "en-US",
        "page": page,
        "include_adult": False,
        "sort_by": "popularity.desc",
    }

    if genre_id is not None:
        params["with_genres"] = genre_id

    response = httpx.get(
        url,
        headers=get_tmdb_headers(),
        params=params,
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