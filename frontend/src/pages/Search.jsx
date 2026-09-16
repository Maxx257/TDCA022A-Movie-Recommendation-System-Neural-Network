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
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 lg:px-16">

        <Link
          to="/"
          className="inline-flex items-center text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Home
        </Link>


        {/* Page heading */}
        <div className="mt-10 max-w-3xl">

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Find Something
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            Search Movies
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Search for movies by title.
          </p>

        </div>


        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row"
        >

          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search movies..."
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-900/70 px-5 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-white/30 focus:ring-2 focus:ring-white/5"
          />


          <button
            type="submit"
            className="rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Search
          </button>

        </form>


        {/* Results heading */}
        {queryFromUrl && (
          <div className="mt-12">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Search Results
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              Results for{" "}
              <span className="text-zinc-300">
                "{queryFromUrl}"
              </span>
            </h2>
          </div>
        )}


        {/* Loading */}
        {loading && (
          <p className="mt-8 text-sm text-zinc-500">
            Searching...
          </p>
        )}


        {/* Error */}
        {error && (
          <div className="mt-8 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}


        {/* No results */}
        {!loading &&
          !error &&
          queryFromUrl &&
          movies.length === 0 && (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <p className="text-sm text-zinc-400">
                No movies found.
              </p>
            </div>
          )}


        {/* Movie grid */}
        {!loading &&
          !error &&
          movies.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

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