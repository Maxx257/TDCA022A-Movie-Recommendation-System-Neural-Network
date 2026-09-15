import { useEffect, useState } from "react";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import MovieCard from "./MovieCard";


function NeuralRecommendations() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [movies, setMovies] = useState([]);
  const [profileInteractions, setProfileInteractions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadNeuralRecommendations = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setMovies([]);
        setProfileInteractions(0);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(
          "/recommendations/neural",
          {
            params: {
              limit: 12,
            },
          }
        );

        const neuralResults = response.data.results || [];

        setProfileInteractions(
          response.data.profile_interactions || 0
        );

        if (neuralResults.length === 0) {
          setMovies([]);
          return;
        }

        const movieRequests = neuralResults.map(
          (item) =>
            apiClient.get(
              `/movies/${item.tmdb_id}`
            )
        );

        const movieResponses = await Promise.allSettled(
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
          "Could not load neural recommendations:",
          error
        );

        setError(
          "Could not load AI recommendations."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNeuralRecommendations();
  }, [user, authLoading]);


  if (authLoading || !user) {
    return null;
  }


  if (loading) {
    return (
      <section className="px-6 pb-12 md:px-16 lg:px-24">
        <p className="text-zinc-400">
          Generating AI recommendations...
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
          Neural Recommendations
        </p>

        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          AI Picks for You
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Generated using your preferences and our trained neural recommendation model.
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Based on {profileInteractions} mapped interactions.
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


export default NeuralRecommendations;