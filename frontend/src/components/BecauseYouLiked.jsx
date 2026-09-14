import { useEffect, useState } from "react";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import MovieCard from "./MovieCard";


function BecauseYouLiked() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [seedTitle, setSeedTitle] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadRecommendations = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setMovies([]);
        setSeedTitle("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(
          "/recommendations/because-you-liked",
          {
            params: {
              limit: 6,
            },
          }
        );

        setSeedTitle(
          response.data.seed_title || ""
        );

        setMovies(
          response.data.results || []
        );
      } catch (error) {
        console.error(
          "Could not load Because You Liked recommendations:",
          error
        );

        setError(
          "Could not load related recommendations."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user, authLoading]);


  if (authLoading || !user) {
    return null;
  }


  if (loading) {
    return (
      <section className="px-6 pb-12 md:px-16 lg:px-24">
        <p className="text-zinc-400">
          Loading related recommendations...
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


  if (!seedTitle || movies.length === 0) {
    return null;
  }


  return (
    <section className="px-6 pb-16 md:px-16 lg:px-24">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          More like this
        </p>

        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          Because You Liked {seedTitle}
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Movies related to one of your recent favourites.
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


export default BecauseYouLiked;