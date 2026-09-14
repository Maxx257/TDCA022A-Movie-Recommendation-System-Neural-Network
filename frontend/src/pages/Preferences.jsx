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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
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
    <div className="min-h-screen bg-zinc-950 px-6 py-10 text-white md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
            Personalize your experience
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Choose movies you like
          </h1>

          <p className="mt-3 text-zinc-400">
            Select at least 3 movies so we can understand your preferences.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Selected: {selectedMovies.length}
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-md bg-red-950 p-4 text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-zinc-400">
            Loading movies...
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((movie) => {
              const selected =
                selectedMovies.includes(movie.id);

              return (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() =>
                    toggleMovie(movie.id)
                  }
                  className={
                    selected
                      ? "group overflow-hidden rounded-lg border-2 border-red-500 bg-zinc-900 text-left"
                      : "group overflow-hidden rounded-lg border-2 border-transparent bg-zinc-900 text-left transition hover:border-zinc-700"
                  }
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-zinc-800">
                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={`${movie.title} poster`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-3 text-center text-sm text-zinc-500">
                        No poster
                      </div>
                    )}

                    {selected && (
                      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-bold">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="truncate font-semibold">
                      {movie.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && (
          <div className="sticky bottom-0 mt-10 border-t border-zinc-800 bg-zinc-950/95 py-5 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-400">
                Choose at least 3 movies.
              </p>

              <button
                type="button"
                onClick={savePreferences}
                disabled={
                  saving ||
                  selectedMovies.length < 3
                }
                className="rounded-md bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
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