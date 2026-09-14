import { useEffect, useState } from "react";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import MovieCard from "./MovieCard";


function TopPicks() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadTopPicks = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setMovies([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(
          "/recommendations/for-me",
          {
            params: {
              limit: 12,
            },
          }
        );

        setMovies(response.data);
      } catch (error) {
        console.error(
          "Could not load personalized recommendations:",
          error
        );

        setError(
          "Could not load your recommendations."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTopPicks();
  }, [user, authLoading]);


  if (authLoading || !user) {
    return null;
  }


  if (loading) {
    return (
      <section className="px-6 pb-12 md:px-16 lg:px-24">
        <p className="text-zinc-400">
          Loading your recommendations...
        </p>
      </section>
    );
  }


  if (error) {
    return (
      <section className="px-6 pb-12 md:px-16 lg:px-24">
        <p className="text-red-400">
          {error}
        </p>
      </section>
    );
  }


  if (movies.length === 0) {
    return null;
  }


  return (
    <section className="px-6 pb-16 md:px-16 lg:px-24">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          Personalized for you
        </p>

        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          Top Picks for You
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Recommendations based on your favourites, ratings and viewing history.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}
      </div>
    </section>
  );
}


export default TopPicks;