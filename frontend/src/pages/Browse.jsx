import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../api/client";
import MovieCard from "../components/MovieCard";
import FilterDropdown from "../components/FilterDropdown";


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


  /*
    Convert all filter data into the format
    expected by FilterDropdown:
    { value, label }
  */

  const genreOptions = genres.map((genre) => ({
    value: genre.id,
    label: genre.name,
  }));


  const yearOptions = years.map((year) => ({
    value: year,
    label: year.toString(),
  }));


  const ratingOptions = [
    { value: "5", label: "5+ ★" },
    { value: "6", label: "6+ ★" },
    { value: "7", label: "7+ ★" },
    { value: "8", label: "8+ ★" },
    { value: "9", label: "9+ ★" },
  ];


  const languageOptions = languages.map(
    (language) => ({
      value: language.code,
      label: language.name,
    })
  );


  const countryOptions = countries.map(
    (country) => ({
      value: country.code,
      label: country.name,
    })
  );


  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await apiClient.get(
          "/movies/genres"
        );

        setGenres(response.data.genres);
      } catch (error) {
        console.error(error);

        setError(
          "Could not load movie genres."
        );
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
          params.language_code =
            selectedLanguage;
        }


        if (selectedCountry) {
          params.country_code =
            selectedCountry;
        }


        const response = await apiClient.get(
          "/movies/discover",
          {
            params,
          }
        );


        setMovies(
          response.data.results
        );

      } catch (error) {
        console.error(error);

        setError(
          "Could not load movies."
        );

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
            Explore
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            Browse Movies
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Explore movies using genre, year, rating,
            language and country.
          </p>

        </div>


        {/* Filters */}
        <section className="relative z-40 mt-10">

          <div className="overflow-visible rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">

            <div className="mb-5">

              <h2 className="text-sm font-medium text-white">
                Filter movies
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Refine the collection to find what you want.
              </p>

            </div>


            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">


              {/* Genre */}
              <div>

                <label
                  htmlFor="genre"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Genre
                </label>

                <FilterDropdown
                  id="genre"
                  value={selectedGenre}
                  onChange={setSelectedGenre}
                  options={genreOptions}
                  placeholder="All Genres"
                />

              </div>


              {/* Year */}
              <div>

                <label
                  htmlFor="year"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Release Year
                </label>

                <FilterDropdown
                  id="year"
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={yearOptions}
                  placeholder="All Years"
                />

              </div>


              {/* Rating */}
              <div>

                <label
                  htmlFor="rating"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Minimum Rating
                </label>

                <FilterDropdown
                  id="rating"
                  value={selectedRating}
                  onChange={setSelectedRating}
                  options={ratingOptions}
                  placeholder="Any Rating"
                />

              </div>


              {/* Language */}
              <div>

                <label
                  htmlFor="language"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Language
                </label>

                <FilterDropdown
                  id="language"
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  options={languageOptions}
                  placeholder="All Languages"
                />

              </div>


              {/* Country */}
              <div>

                <label
                  htmlFor="country"
                  className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                >
                  Country
                </label>

                <FilterDropdown
                  id="country"
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  options={countryOptions}
                  placeholder="All Countries"
                />

              </div>


              {/* Clear button */}
              <div className="flex items-end">

                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Clear Filters
                </button>

              </div>


            </div>

          </div>

        </section>


        {/* Results */}
        <section className="relative z-0 mt-12">


          {loading && (
            <p className="text-sm text-zinc-500">
              Loading movies...
            </p>
          )}


          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">

              <p className="text-sm text-red-300">
                {error}
              </p>

            </div>
          )}


          {!loading &&
            !error &&
            movies.length === 0 && (

              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">

                <p className="text-sm text-zinc-400">
                  No movies found for these filters.
                </p>

              </div>
            )}


          {!loading &&
            !error &&
            movies.length > 0 && (
              <>

                <div className="mb-7 flex items-end justify-between">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                      Results
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                      Movies for You
                    </h2>

                  </div>

                </div>


                <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                  {movies.map((movie) => (

                    <MovieCard
                      key={movie.id}
                      movie={movie}
                    />

                  ))}

                </div>

              </>
            )}


        </section>

      </div>

    </div>
  );
}


export default Browse;