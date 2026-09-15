import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import apiClient from "../api/client";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";


function MyList() {
  const { user, loading: authLoading } = useAuth();

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
        const favoritesResponse = await apiClient.get(
          "/favorites"
        );

        const favorites = favoritesResponse.data;

        const movieRequests = favorites.map(
          (favorite) =>
            apiClient.get(
              `/movies/${favorite.movie_id}`
            )
        );

        const movieResponses = await Promise.all(
          movieRequests
        );

        setMovies(
          movieResponses.map(
            (response) => response.data
          )
        );
      } catch (error) {
        console.error(error);
        setError("Could not load your favourites.");
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading...
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 text-white md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            My Favourites
          </h1>

          <p className="mt-2 text-zinc-400">
            Movies you have added to your favourites.
          </p>
        </div>

        {loading && (
          <p className="mt-10 text-zinc-400">
            Loading your movies...
          </p>
        )}

        {error && (
          <p className="mt-10 rounded-md bg-red-950 p-4 text-red-300">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          movies.length === 0 && (
            <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <h2 className="text-xl font-semibold">
                Your list is empty
              </h2>

              <p className="mt-2 text-zinc-400">
                Add movies to your favourites and they will appear here.
              </p>

              <Link
                to="/browse"
                className="mt-6 inline-block rounded-md bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
              >
                Browse Movies
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          movies.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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


export default MyList;