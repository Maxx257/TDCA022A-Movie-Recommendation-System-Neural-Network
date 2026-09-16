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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Loading watchlist...
      </div>
    );
  }


  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center text-white">

        <div className="max-w-md">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-zinc-300">
            +
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Watchlist
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Your Watchlist
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Log in to view movies you saved for later.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Login
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 lg:px-16">

        <Link
          to="/"
          className="inline-flex items-center text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Home
        </Link>


        {/* Page heading */}
        <div className="mt-10 max-w-3xl">

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Saved for Later
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            My Watchlist
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Movies you saved to watch later.
          </p>

        </div>


        {/* Error */}
        {error && (
          <div className="mt-12 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}


        {/* Empty watchlist */}
        {!error && movies.length === 0 ? (
          <div className="mt-12 flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] px-6 text-center">

            <div className="max-w-md">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-zinc-300">
                +
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">
                Your watchlist is empty
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Browse movies and save the ones you want to watch later.
              </p>

              <Link
                to="/browse"
                className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Browse Movies
              </Link>

            </div>

          </div>
        ) : (
          !error && (
            <section className="mt-12">

              <div className="mb-7">

                <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                  Saved Movies
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                  {movies.length}{" "}
                  {movies.length === 1
                    ? "Movie"
                    : "Movies"}
                </h2>

              </div>


              <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}

              </div>

            </section>
          )
        )}

      </div>

    </div>
  );
}


export default Watchlist;