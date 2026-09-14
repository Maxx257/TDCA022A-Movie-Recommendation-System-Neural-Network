import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";


function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(3);
  const [ratingLoading, setRatingLoading] = useState(false);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recordedMovieRef = useRef(null);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const response = await apiClient.get(
          `/movies/${movieId}`
        );

        setMovie(response.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 404) {
          setError("Movie not found.");
        } else {
          setError("Could not load movie details.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [movieId]);

  useEffect(() => {
  const loadUserRating = async () => {
    if (!user) {
      setUserRating(null);
      return;
    }

    try {
      const response = await apiClient.get(
        `/ratings/${movieId}`
      );

      setUserRating(response.data.rating);

      if (response.data.rating !== null) {
  setSelectedRating(response.data.rating);
} else {
  setSelectedRating(3);
}
    } catch (error) {
      console.error(
        "Could not load user rating:",
        error
      );
    }
  };

  loadUserRating();
}, [movieId, user]);

useEffect(() => {
  const recordMovieView = async () => {
    if (!user || !movie) {
      return;
    }

    const historyKey = `${user.id}-${movie.id}`;

    if (recordedMovieRef.current === historyKey) {
      return;
    }

    recordedMovieRef.current = historyKey;

    try {
      await apiClient.post(
        `/history/${movie.id}`
      );
    } catch (error) {
      console.error(
        "Could not record movie view:",
        error
      );
    }
  };

  recordMovieView();
}, [movie, user]);

  useEffect(() => {
  const loadFavoriteStatus = async () => {
    if (!user) {
      setIsFavorite(false);
      return;
    }

    try {
      const response = await apiClient.get(
        `/favorites/${movieId}/status`
      );

      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error(
        "Could not load favorite status:",
        error
      );
    }
  };

  loadFavoriteStatus();
}, [movieId, user]);

const handleFavorite = async () => {
  if (!user) {
    navigate("/login");
    return;
  }

  setFavoriteLoading(true);

  try {
    if (isFavorite) {
      await apiClient.delete(
        `/favorites/${movie.id}`
      );

      setIsFavorite(false);
    } else {
      await apiClient.post(
        "/favorites",
        {
          movie_id: movie.id,
        }
      );

      setIsFavorite(true);
    }
  } catch (error) {
    console.error(
      "Could not update favorite:",
      error
    );
  } finally {
    setFavoriteLoading(false);
  }
};

const handleSaveRating = async () => {
  if (!user) {
    navigate("/login");
    return;
  }

  setRatingLoading(true);

  try {
    if (userRating === null) {
      await apiClient.post(
        "/ratings",
        {
          movie_id: movie.id,
          rating: selectedRating,
        }
      );
    } else {
      await apiClient.put(
        `/ratings/${movie.id}`,
        {
          rating: selectedRating,
        }
      );
    }

    setUserRating(selectedRating);
  } catch (error) {
    console.error(
      "Could not save rating:",
      error
    );
  } finally {
    setRatingLoading(false);
  }
};

const handleRemoveRating = async () => {
  if (!user || userRating === null) {
    return;
  }

  setRatingLoading(true);

  try {
    await apiClient.delete(
      `/ratings/${movie.id}`
    );

    setUserRating(null);
    setSelectedRating(3);
  } catch (error) {
    console.error(
      "Could not remove rating:",
      error
    );
  } finally {
    setRatingLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading movie...
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-white">
        <p className="text-lg text-red-400">
          {error}
        </p>

        <Link
          to="/"
          className="mt-6 rounded-md bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }


  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "N/A";

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "N/A";


  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="relative min-h-[520px] overflow-hidden">
        {movie.backdrop_url && (
          <img
            src={movie.backdrop_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-end md:px-12 md:py-16">
          <div className="w-48 shrink-0 sm:w-56 md:w-64">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={`${movie.title} poster`}
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                No poster
              </div>
            )}
          </div>

          <div className="max-w-3xl">
            <Link
              to="/"
              className="mb-5 inline-block text-sm text-zinc-300 hover:text-white"
            >
              ← Back to movies
            </Link>

            <h1 className="text-4xl font-bold sm:text-5xl">
              {movie.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-300">
              <span>{releaseYear}</span>
              <span>•</span>
              <span>{runtime}</span>
              <span>•</span>
              <span>
                ★ {movie.vote_average.toFixed(1)}
              </span>
              <span>
                ({movie.vote_count.toLocaleString()} votes)
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-6">
  <button
    type="button"
    onClick={handleFavorite}
    disabled={favoriteLoading}
    className={
      isFavorite
        ? "rounded-md bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700 disabled:opacity-50"
        : "rounded-md bg-zinc-800 px-6 py-3 font-semibold transition hover:bg-zinc-700 disabled:opacity-50"
    }
  >
    {favoriteLoading
      ? "Updating..."
      : isFavorite
        ? "♥ Favourited"
        : "♡ Add to Favourites"}
  </button>
</div>
<div className="mt-6 max-w-md rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
  <h3 className="font-semibold">
    Your Rating
  </h3>

  <p className="mt-1 text-sm text-zinc-400">
    Rate this movie from 0.5 to 5 stars.
  </p>

  {userRating !== null && (
    <p className="mt-3 text-sm text-yellow-400">
      Your current rating: ★ {userRating.toFixed(1)} / 5
    </p>
  )}

  <div className="mt-4 flex flex-wrap gap-2">
    {[
      0.5,
      1,
      1.5,
      2,
      2.5,
      3,
      3.5,
      4,
      4.5,
      5,
    ].map((rating) => (
      <button
        key={rating}
        type="button"
        onClick={() => setSelectedRating(rating)}
        className={
          selectedRating === rating
            ? "rounded-md bg-red-600 px-3 py-2 text-sm font-semibold"
            : "rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-700"
        }
      >
        {rating} ★
      </button>
    ))}
  </div>

  <div className="mt-4 flex flex-wrap gap-3">
    <button
      type="button"
      onClick={handleSaveRating}
      disabled={ratingLoading}
      className="rounded-md bg-red-600 px-5 py-2 font-semibold transition hover:bg-red-700 disabled:opacity-50"
    >
      {ratingLoading
        ? "Saving..."
        : userRating === null
          ? "Save Rating"
          : "Update Rating"}
    </button>

    {userRating !== null && (
      <button
        type="button"
        onClick={handleRemoveRating}
        disabled={ratingLoading}
        className="rounded-md bg-zinc-800 px-5 py-2 font-semibold transition hover:bg-zinc-700 disabled:opacity-50"
      >
        Remove Rating
      </button>
    )}
  </div>
</div>

            <h2 className="mt-8 text-xl font-semibold">
              Overview
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
              {movie.overview || "No overview available."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
        <h2 className="mb-6 text-2xl font-bold">
          Cast
        </h2>

        {movie.cast.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {movie.cast.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-lg bg-zinc-900"
              >
                <div className="aspect-[2/3] bg-zinc-800">
                  {member.profile_url ? (
                    <img
                      src={member.profile_url}
                      alt={member.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-500">
                      No photo
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-sm font-semibold">
                    {member.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    {member.character || "Unknown role"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">
            Cast information is unavailable.
          </p>
        )}
      </section>
    </div>
  );
}


export default MovieDetails;