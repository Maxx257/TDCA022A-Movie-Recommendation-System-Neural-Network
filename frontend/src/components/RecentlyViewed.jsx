import { useEffect, useState } from "react";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import MovieCard from "./MovieCard";

function RecentlyViewed() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

    console.log("RecentlyViewed rendered");
    console.log("user =", user);
    console.log("authLoading =", authLoading);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadRecentlyViewed = async () => {
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
        console.log("Calling GET /history");

        const historyResponse = await apiClient.get(
          "/history"
        );

        console.log("History data:", historyResponse.data);

        const recentHistory =
          historyResponse.data.slice(0, 6);

        if (recentHistory.length === 0) {
          setMovies([]);
          return;
        }

        const movieRequests = recentHistory.map(
          (historyItem) =>
            apiClient.get(
              `/movies/${historyItem.movie_id}`
            )
        );

        const movieResponses =
          await Promise.allSettled(movieRequests);

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
          "Could not load recently viewed movies:",
          error
        );

        setError(
          "Could not load recently viewed movies."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, [user, authLoading]);


  if (authLoading || !user) {
    return null;
  }


  if (loading) {
    return (
      <section className="px-6 pb-12 md:px-16 lg:px-24">
        <p className="text-zinc-400">
          Loading recently viewed...
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
        <h2 className="text-2xl font-bold sm:text-3xl">
          Recently Viewed
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Continue exploring movies you recently viewed.
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


export default RecentlyViewed;