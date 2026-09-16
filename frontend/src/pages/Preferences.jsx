import { useEffect, useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";


function Preferences() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await apiClient.get(
          "/movies/popular"
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
  }, []);


  const toggleMovie = (movieId) => {
    setSelectedMovies((currentMovies) => {
      if (currentMovies.includes(movieId)) {
        return currentMovies.filter(
          (id) => id !== movieId
        );
      }

      return [
        ...currentMovies,
        movieId,
      ];
    });
  };


  const savePreferences = async () => {
    if (selectedMovies.length < 3) {
      setError(
        "Please select at least 3 movies."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const requests = selectedMovies.map(
        (movieId) =>
          apiClient.post(
            "/favorites",
            {
              movie_id: movieId,
            }
          )
      );

      await Promise.allSettled(requests);

      navigate("/");
    } catch (error) {
      console.error(error);

      setError(
        "Could not save your preferences."
      );
    } finally {
      setSaving(false);
    }
  };


  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Loading...
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 lg:px-16">

        {/* Heading */}
        <div className="max-w-3xl">

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Personalize Your Experience
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            Choose movies you like
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Select at least 3 movies so we can understand your preferences.
          </p>

          <div className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
            Selected: {selectedMovies.length}
          </div>

        </div>


        {/* Error */}
        {error && (
          <div className="mt-8 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}


        {/* Loading */}
        {loading ? (
          <p className="mt-12 text-sm text-zinc-500">
            Loading movies...
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

            {movies.map((movie) => {
              const selected =
                selectedMovies.includes(
                  movie.id
                );

              return (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() =>
                    toggleMovie(movie.id)
                  }
                  className="group text-left"
                >

                  <div
                    className={
                      selected
                        ? "relative aspect-[2/3] overflow-hidden rounded-lg border-2 border-white bg-zinc-900 shadow-xl shadow-black/30 transition duration-300"
                        : "relative aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent bg-zinc-900 shadow-lg shadow-black/20 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/15 group-hover:shadow-2xl group-hover:shadow-black/40"
                    }
                  >

                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={`${movie.title} poster`}
                        className={
                          selected
                            ? "h-full w-full object-cover brightness-75 transition duration-500"
                            : "h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        }
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-3 text-center text-sm text-zinc-500">
                        No poster
                      </div>
                    )}


                    {/* Selected overlay */}
                    {selected && (
                      <>
                        <div className="absolute inset-0 bg-black/15" />

                        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-lg">
                          ✓
                        </div>
                      </>
                    )}

                  </div>


                  <div className="pt-3">

                    <p
                      className={
                        selected
                          ? "truncate text-sm font-medium text-white"
                          : "truncate text-sm font-medium text-zinc-200 transition group-hover:text-white"
                      }
                    >
                      {movie.title}
                    </p>

                  </div>

                </button>
              );
            })}

          </div>
        )}


        {/* Sticky continue bar */}
        {!loading && (
          <div className="sticky bottom-0 z-20 mt-12 border-t border-white/10 bg-zinc-950/90 py-5 backdrop-blur-xl">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm text-zinc-300">
                  {selectedMovies.length < 3
                    ? `Choose ${
                        3 -
                        selectedMovies.length
                      } more ${
                        3 -
                          selectedMovies.length ===
                        1
                          ? "movie"
                          : "movies"
                      }.`
                    : "You're ready to continue."}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  These choices help personalize your recommendations.
                </p>

              </div>


              <button
                type="button"
                onClick={savePreferences}
                disabled={
                  saving ||
                  selectedMovies.length < 3
                }
                className="rounded-lg bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {saving
                  ? "Saving..."
                  : "Continue"}
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}


export default Preferences;