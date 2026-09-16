import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import SimilarMovies from "../components/SimilarMovies";
import TrailerModal from "../components/TrailerModal";


function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [userRating, setUserRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(3);
  const [ratingLoading, setRatingLoading] = useState(false);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const recordedMovieRef = useRef(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

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
          setError(
            "Could not load movie details."
          );
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
          setSelectedRating(
            response.data.rating
          );
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

      const historyKey =
        `${user.id}-${movie.id}`;

      if (
        recordedMovieRef.current ===
        historyKey
      ) {
        return;
      }

      recordedMovieRef.current =
        historyKey;

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

        setIsFavorite(
          response.data.is_favorite
        );
      } catch (error) {
        console.error(
          "Could not load favorite status:",
          error
        );
      }
    };

    loadFavoriteStatus();
  }, [movieId, user]);


  useEffect(() => {
    const loadWatchlistStatus = async () => {
      if (!user || !movie) {
        setInWatchlist(false);
        return;
      }

      try {
        const response = await apiClient.get(
          `/watchlist/${movie.id}/status`
        );

        setInWatchlist(
          response.data.in_watchlist
        );
      } catch (error) {
        console.error(
          "Could not load watchlist status:",
          error
        );
      }
    };

    loadWatchlistStatus();
  }, [user, movie]);


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


  const handleWatchlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!movie || watchlistLoading) {
      return;
    }

    setWatchlistLoading(true);

    try {
      if (inWatchlist) {
        await apiClient.delete(
          `/watchlist/${movie.id}`
        );

        setInWatchlist(false);
      } else {
        await apiClient.post(
          "/watchlist",
          {
            movie_id: movie.id,
          }
        );

        setInWatchlist(true);
      }
    } catch (error) {
      console.error(
        "Could not update watchlist:",
        error
      );
    } finally {
      setWatchlistLoading(false);
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Loading movie...
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">

        <p className="text-lg text-red-400">
          {error}
        </p>

        <Link
          to="/"
          className="mt-6 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Back to Home
        </Link>

      </div>
    );
  }


  const releaseYear =
    movie.release_date
      ? movie.release_date.slice(0, 4)
      : "N/A";


  const runtime =
    movie.runtime
      ? `${Math.floor(
          movie.runtime / 60
        )}h ${movie.runtime % 60}m`
      : "N/A";


  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Movie section */}
      <section className="relative overflow-hidden">

        {movie.backdrop_url && (
          <img
            src={movie.backdrop_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
          />
        )}


        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/30" />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/20" />


        <div className="relative mx-auto max-w-7xl px-6 py-10 md:px-12 md:py-16">

          <div className="grid gap-10 md:grid-cols-[320px_minmax(0,1fr)] lg:gap-14">


            {/* LEFT COLUMN */}
            <div className="mx-auto w-full max-w-[320px] md:mx-0 md:max-w-none">


              {/* Poster */}
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={`${movie.title} poster`}
                  className="w-full rounded-xl shadow-2xl shadow-black/50"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-sm text-zinc-500">
                  No poster
                </div>
              )}


              {/* Rating */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">

                <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
                  Your Rating
                </p>

                <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
                  Rate this movie
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  Choose a score from 0.5 to 5 stars.
                </p>


                {userRating !== null && (
                  <p className="mt-4 text-sm text-zinc-300">
                    Your current rating:{" "}
                    <span className="font-medium text-yellow-400">
                      ★ {userRating.toFixed(1)} / 5
                    </span>
                  </p>
                )}


                <div className="mt-5 flex flex-wrap gap-2">

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
                      onClick={() =>
                        setSelectedRating(
                          rating
                        )
                      }
                      className={
                        selectedRating === rating
                          ? "rounded-md bg-white px-3 py-2 text-sm font-semibold text-black"
                          : "rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                      }
                    >
                      {rating} ★
                    </button>
                  ))}

                </div>

              {/* Movie details */}
<div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">

  <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
    Movie Details
  </p>


  <div className="mt-5 divide-y divide-white/5">

    <div className="flex items-center justify-between py-3 first:pt-0">
      <span className="text-sm text-zinc-500">
        Release
      </span>

      <span className="text-sm font-medium text-zinc-200">
        {movie.release_date || "N/A"}
      </span>
    </div>


    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-500">
        Runtime
      </span>

      <span className="text-sm font-medium text-zinc-200">
        {runtime}
      </span>
    </div>


    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-500">
        Language
      </span>

      <span className="text-sm font-medium uppercase text-zinc-200">
        {movie.original_language || "N/A"}
      </span>
    </div>


    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-500">
        TMDB Rating
      </span>

      <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-200">
        <span className="text-yellow-400">
          ★
        </span>

        {movie.vote_average.toFixed(1)}
      </span>
    </div>


    <div className="flex items-center justify-between py-3 last:pb-0">
      <span className="text-sm text-zinc-500">
        Votes
      </span>

      <span className="text-sm font-medium text-zinc-200">
        {movie.vote_count.toLocaleString()}
      </span>
    </div>

  </div>


  {/* Genres */}
  <div className="mt-5 border-t border-white/10 pt-5">

    <p className="mb-3 text-xs uppercase tracking-wider text-zinc-600">
      Genres
    </p>

    <div className="flex flex-wrap gap-2">

      {movie.genres.map((genre) => (
        <span
          key={genre}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
        >
          {genre}
        </span>
      ))}

    </div>

  </div>

</div>

                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={handleSaveRating}
                    disabled={ratingLoading}
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove Rating
                    </button>
                  )}

                </div>

              </div>

            </div>


            {/* RIGHT COLUMN */}
            <div className="min-w-0">

              <Link
                to="/"
                className="mb-8 inline-flex text-sm text-zinc-400 transition hover:text-white"
              >
                ← Back to movies
              </Link>


              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                {movie.title}
              </h1>


              {/* Movie information */}
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-300">

                <span>
                  {releaseYear}
                </span>

                <span className="text-zinc-600">
                  •
                </span>

                <span>
                  {runtime}
                </span>

                <span className="text-zinc-600">
                  •
                </span>

                <span className="flex items-center gap-1.5">

                  <span className="text-yellow-400">
                    ★
                  </span>

                  {movie.vote_average.toFixed(1)}

                </span>

                <span className="text-zinc-500">
                  ({movie.vote_count.toLocaleString()} votes)
                </span>

              </div>


              {/* Genres */}
              <div className="mt-6 flex flex-wrap gap-2">

                {movie.genres.map(
                  (genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm"
                    >
                      {genre}
                    </span>
                  )
                )}

              </div>


              {/* Favourite + Watchlist + Trailer */}
              <div className="mt-8 flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={
                    isFavorite
                      ? "min-w-[190px] rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                      : "min-w-[190px] rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  {favoriteLoading
                    ? "Updating..."
                    : isFavorite
                      ? "♥ Favourited"
                      : "♡ Add to Favourites"}
                </button>


                <button
                  type="button"
                  onClick={handleWatchlist}
                  disabled={watchlistLoading}
                  className={
                    inWatchlist
                      ? "min-w-[190px] rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                      : "min-w-[190px] rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  {watchlistLoading
                    ? "Updating..."
                    : inWatchlist
                      ? "✓ In Watchlist"
                      : "+ Add to Watchlist"}
                </button>

                {movie.trailer ? (
                <button
                  type="button"
                  onClick={() =>
                    setTrailerOpen(true)
                  }
                  className="min-w-[190px] rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  ▶ Watch Trailer
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="min-w-[190px] cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-600"
                >
                  Trailer Unavailable
                </button>
)}

              </div>


              {/* Overview */}
              <div className="mt-10 max-w-3xl border-t border-white/10 pt-8">

                <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
                  Story
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                  Overview
                </h2>

                <p className="mt-4 text-base leading-8 text-zinc-300">
                  {movie.overview ||
                    "No overview available."}
                </p>

              </div>


              {/* Cast */}
              <div className="mt-10 border-t border-white/10 pt-8">

                <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
                  Featured
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                  Cast
                </h2>


                {movie.cast.length > 0 ? (
                  <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-5">

                    {movie.cast
                      .slice(0, 10)
                      .map((member) => (
                        <article
                          key={member.id}
                          className="group min-w-0"
                        >

                          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-lg shadow-black/20">

                            {member.profile_url ? (
                              <img
                                src={
                                  member.profile_url
                                }
                                alt={member.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-600">
                                No photo
                              </div>
                            )}

                          </div>


                          <p className="mt-2 truncate text-sm font-medium text-zinc-200">
                            {member.name}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-4 text-zinc-500">
                            {member.character ||
                              "Unknown role"}
                          </p>

                        </article>
                      ))}

                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    Cast information is unavailable.
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* Similar movies */}
      <SimilarMovies
        movieId={movie.id}
      />

{trailerOpen && movie.trailer && (
  <TrailerModal
    trailer={movie.trailer}
    onClose={() =>
      setTrailerOpen(false)
    }
  />
)}

    </div>
  );
}


export default MovieDetails;