import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import apiClient from "../api/client";
import MovieCard from "../components/MovieCard";


function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryFromUrl = searchParams.get("q") || "";

  const [searchText, setSearchText] = useState(queryFromUrl);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const searchForMovies = async () => {
      if (!queryFromUrl.trim()) {
        setMovies([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(
          "/movies/search",
          {
            params: {
              query: queryFromUrl,
              page: 1,
            },
          }
        );

        setMovies(response.data.results);
      } catch (error) {
        console.error(error);
        setError("Could not search for movies.");
      } finally {
        setLoading(false);
      }
    };

    searchForMovies();
  }, [queryFromUrl]);


  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedQuery = searchText.trim();

    if (!cleanedQuery) {
      return;
    }

    setSearchParams({
      q: cleanedQuery,
    });
  };


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
            Search Movies
          </h1>

          <p className="mt-2 text-zinc-400">
            Search for movies by title.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex max-w-2xl gap-3"
        >
          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search movies..."
            className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-red-500"
          />

          <button
            type="submit"
            className="rounded-md bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
          >
            Search
          </button>
        </form>

        {queryFromUrl && (
          <h2 className="mt-10 text-xl font-semibold">
            Results for "{queryFromUrl}"
          </h2>
        )}

        {loading && (
          <p className="mt-8 text-zinc-400">
            Searching...
          </p>
        )}

        {error && (
          <p className="mt-8 rounded-md bg-red-950 p-4 text-red-300">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          queryFromUrl &&
          movies.length === 0 && (
            <p className="mt-8 text-zinc-400">
              No movies found.
            </p>
          )}

        {!loading &&
          !error &&
          movies.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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


export default Search;