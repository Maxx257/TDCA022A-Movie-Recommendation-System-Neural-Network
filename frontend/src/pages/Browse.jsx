import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../api/client";
import MovieCard from "../components/MovieCard";


function Browse() {
  const [genres, setGenres] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: 50 },
    (_, index) => currentYear - index
  );

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "ml", name: "Malayalam" },
    { code: "kn", name: "Kannada" },
    { code: "bn", name: "Bengali" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  const countries = [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "FR", name: "France" },
    { code: "DE", name: "Germany" },
    { code: "ES", name: "Spain" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
  ];


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

        if (selectedYear) {
          params.year = selectedYear;
        }

        if (selectedRating) {
          params.min_rating = selectedRating;
        }

        if (selectedLanguage) {
          params.language_code = selectedLanguage;
        }

        if (selectedCountry) {
          params.country_code = selectedCountry;
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
  }, [
    selectedGenre,
    selectedYear,
    selectedRating,
    selectedLanguage,
    selectedCountry,
  ]);


  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSelectedRating("");
    setSelectedLanguage("");
    setSelectedCountry("");
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
            Browse Movies
          </h1>

          <p className="mt-2 text-zinc-400">
            Explore movies using genre, year, rating, language and country.
          </p>
        </div>

        <div className="mt-8 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
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
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">All Genres</option>

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

          <div>
            <label
              htmlFor="year"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Release Year
            </label>

            <select
              id="year"
              value={selectedYear}
              onChange={(event) =>
                setSelectedYear(event.target.value)
              }
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">All Years</option>

              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rating"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Minimum Rating
            </label>

            <select
              id="rating"
              value={selectedRating}
              onChange={(event) =>
                setSelectedRating(event.target.value)
              }
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">Any Rating</option>
              <option value="5">5+ ★</option>
              <option value="6">6+ ★</option>
              <option value="7">7+ ★</option>
              <option value="8">8+ ★</option>
              <option value="9">9+ ★</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Language
            </label>

            <select
              id="language"
              value={selectedLanguage}
              onChange={(event) =>
                setSelectedLanguage(event.target.value)
              }
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">All Languages</option>

              {languages.map((language) => (
                <option
                  key={language.code}
                  value={language.code}
                >
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Country
            </label>

            <select
              id="country"
              value={selectedCountry}
              onChange={(event) =>
                setSelectedCountry(event.target.value)
              }
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-red-500"
            >
              <option value="">All Countries</option>

              {countries.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                >
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-md bg-zinc-800 px-4 py-3 font-semibold transition hover:bg-zinc-700"
            >
              Clear Filters
            </button>
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
              No movies found for these filters.
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