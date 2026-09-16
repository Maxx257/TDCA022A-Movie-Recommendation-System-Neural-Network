import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
} from "react-router-dom";

import apiClient from "../api/client";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";


function MyList() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const favoritesResponse =
          await apiClient.get(
            "/favorites"
          );

        const favorites =
          favoritesResponse.data;

        const movieRequests =
          favorites.map(
            (favorite) =>
              apiClient.get(
                `/movies/${favorite.movie_id}`
              )
          );

        const movieResponses =
          await Promise.all(
            movieRequests
          );

        setMovies(
          movieResponses.map(
            (response) =>
              response.data
          )
        );
      } catch (error) {
        console.error(error);

        setError(
          "Could not load your favourites."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadFavorites();
    }
  }, [user, authLoading]);


  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Loading...
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
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
            Your Collection
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            My Favourites
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Movies you have added to your favourites.
          </p>

        </div>


        {/* Loading */}
        {loading && (
          <p className="mt-12 text-sm text-zinc-500">
            Loading your movies...
          </p>
        )}


        {/* Error */}
        {error && (
          <div className="mt-12 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}


        {/* Empty favourites */}
        {!loading &&
          !error &&
          movies.length === 0 && (
            <div className="mt-12 flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] px-6 text-center">

              <div className="max-w-md">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-zinc-300">
                  ♡
                </div>

                <h2 className="mt-5 text-xl font-semibold tracking-tight text-white">
                  Your favourites are empty
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Save movies you love and they will appear here.
                </p>

                <Link
                  to="/browse"
                  className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Browse Movies
                </Link>

              </div>

            </div>
          )}


        {/* Favourite movies */}
        {!loading &&
          !error &&
          movies.length > 0 && (
            <section className="mt-12">

              <div className="mb-7 flex items-end justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                    Saved Movies
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                    {movies.length}{" "}
                    {movies.length === 1
                      ? "Favourite"
                      : "Favourites"}
                  </h2>
                </div>

              </div>


              <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                {movies.map(
                  (movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                    />
                  )
                )}

              </div>

            </section>
          )}

      </div>

    </div>
  );
}


export default MyList;