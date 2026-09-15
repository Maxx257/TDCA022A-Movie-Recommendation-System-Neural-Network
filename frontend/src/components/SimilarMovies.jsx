import { useEffect, useState } from "react";

import apiClient from "../api/client";
import MovieCard from "./MovieCard";


function SimilarMovies({ movieId }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadSimilarMovies = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(
          `/movies/${movieId}/recommendations`
        );

        setMovies(
          response.data.results.slice(0, 12)
        );
      } catch (error) {
        console.error(
          "Could not load similar movies:",
          error
        );

        setError(
          "Could not load similar movies."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSimilarMovies();
  }, [movieId]);


  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
        <p className="text-zinc-400">
          Loading similar movies...
        </p>
      </section>
    );
  }


  if (error || movies.length === 0) {
    return null;
  }


  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Similar Movies
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Movies you may also enjoy.
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


export default SimilarMovies;