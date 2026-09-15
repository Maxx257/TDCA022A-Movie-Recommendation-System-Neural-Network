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
  const [topGenres, setTopGenres] = useState([]);
  const [profileInteractions, setProfileInteractions] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadRecommendations = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setMovies([]);
        setTopGenres([]);
        setProfileInteractions(0);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(
          "/recommendations/hybrid",
          {
            params: {
              limit: 20,
            },
          }
        );

        const results =
          response.data.results || [];

        setTopGenres(
          response.data.top_genres || []
        );

        setProfileInteractions(
          response.data.profile_interactions || 0
        );

        if (results.length === 0) {
          setMovies([]);
          return;
        }

        const movieRequests = results.map(
          async (recommendation) => {
            const movieResponse =
              await apiClient.get(
                `/movies/${recommendation.tmdb_id}`
              );

            return {
              movie: movieResponse.data,
              recommendation,
            };
          }
        );

        const responses =
          await Promise.allSettled(
            movieRequests
          );

        const loadedMovies = responses
            .filter(
                (result) =>
                result.status === "fulfilled"
            )
            .map(
                (result) => result.value
            )
            .slice(0, 12);

setMovies(loadedMovies);
      } catch (error) {
        console.error(
          "Could not load hybrid recommendations:",
          error
        );

        setError(
          "Could not load AI recommendations."
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
          Hybrid AI Recommendations
        </p>

        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          AI Picks for You
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Personalized using neural learning and your movie preferences.
        </p>

        {topGenres.length > 0 && (
          <p className="mt-2 text-sm text-zinc-500">
            Your current interests:{" "}
            {topGenres.slice(0, 5).join(", ")}
          </p>
        )}

        <p className="mt-1 text-xs text-zinc-600">
          Based on {profileInteractions} mapped interactions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map(
          ({
            movie,
            recommendation,
          }) => (
            <div key={movie.id}>
              <MovieCard
                movie={movie}
              />

              {recommendation.matched_genres?.length > 0 && (
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Because you like{" "}
                  {recommendation.matched_genres.join(
                    ", "
                  )}
                </p>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}


export default NeuralRecommendations;