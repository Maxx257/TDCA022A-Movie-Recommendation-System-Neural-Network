import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../api/client";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";


function Watchlist() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadWatchlist = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setMovies([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(
          "/watchlist"
        );

        const watchlistItems = response.data;

        if (watchlistItems.length === 0) {
          setMovies([]);
          return;
        }

        const movieRequests = watchlistItems.map(
          (item) =>
            apiClient.get(
              `/movies/${item.movie_id}`
            )
        );

        const movieResponses =
          await Promise.allSettled(
            movieRequests
          );

        const loadedMovies = movieResponses
          .filter(
            (result) =>
              result.status === "fulfilled"
          )
          .map(
            (result) => result.value.data
          );

        setMovies(loadedMovies);
      } catch (error) {
        console.error(
          "Could not load watchlist:",
          error
        );

        setError(
          "Could not load your watchlist."
        );
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, [user, authLoading]);


  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading watchlist...
      </div>
    );
  }


  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
        <h1 className="text-3xl font-bold">
          Your Watchlist
        </h1>

        <p className="mt-3 text-zinc-400">
          Log in to view movies you saved for later.
        </p>

        <Link
          to="/login"
          className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
        >
          Login
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        <div className="mb-10">
          <Link
            to="/"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            My Watchlist
          </h1>

          <p className="mt-2 text-zinc-400">
            Movies you saved to watch later.
          </p>
        </div>

        {error && (
          <p className="mb-6 text-red-400">
            {error}
          </p>
        )}

        {!error && movies.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
            <h2 className="text-xl font-semibold">
              Your watchlist is empty
            </h2>

            <p className="mt-2 text-zinc-400">
              Browse movies and add the ones you want to watch later.
            </p>

            <Link
              to="/browse"
              className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export default Watchlist;