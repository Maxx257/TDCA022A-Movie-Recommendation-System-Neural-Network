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
      <section className="px-6 py-14 md:px-16 lg:px-24">
        <p className="text-sm text-zinc-500">
          Loading related recommendations...
        </p>
      </section>
    );
  }


  if (error) {
    return (
      <section className="px-6 py-14 md:px-16 lg:px-24">
        <p className="text-sm text-red-400">
          {error}
        </p>
      </section>
    );
  }


  if (!seedTitle || movies.length === 0) {
    return null;
  }


  return (
    <section className="border-t border-white/5 px-6 py-16 md:px-16 lg:px-24">

      <div className="mb-8 max-w-3xl">

        <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
          More Like This
        </p>

        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
          Because You Liked{" "}
          <span className="text-zinc-300">
            {seedTitle}
          </span>
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Movies related to one of your recent favourites.
        </p>

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
  );
}


export default BecauseYouLiked;