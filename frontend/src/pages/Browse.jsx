import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../api/client";
import MovieCard from "../components/MovieCard";


function Browse() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [movies, setMovies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await apiClient.get("/movies/genres");
        setGenres(response.data.genres);
      } catch (error) {
        console.error(error);
        setError("Could not load movie genres.");
      }
    };

    loadGenres();
  }, []);


  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page: 1,
        };

        if (selectedGenre) {
          params.genre_id = selectedGenre;
        }

        const response = await apiClient.get(
          "/movies/discover",
          { params }
        );

        setMovies(response.data.results);
      } catch (error) {
        console.error(error);
        setError("Could not load movies.");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [selectedGenre]);


  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 text-white md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Browse Movies
            </h1>

            <p className="mt-2 text-zinc-400">
              Explore movies based on your interests.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <label
              htmlFor="genre"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Genre
            </label>

            <select
              id="genre"
              value={selectedGenre}
              onChange={(event) =>
                setSelectedGenre(event.target.value)
              }
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-red-500"
            >
              <option value="">
                All Genres
              </option>

              {genres.map((genre) => (
                <option
                  key={genre.id}
                  value={genre.id}
                >
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <p className="mt-10 text-zinc-400">
            Loading movies...
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
            <p className="mt-10 text-zinc-400">
              No movies found.
            </p>
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


export default Browse;