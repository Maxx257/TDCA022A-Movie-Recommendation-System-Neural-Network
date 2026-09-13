import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import apiClient from "../api/client";


function MovieDetails() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadMovie = async () => {
      try {
        const response = await apiClient.get(
          `/movies/${movieId}`
        );

        setMovie(response.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 404) {
          setError("Movie not found.");
        } else {
          setError("Could not load movie details.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [movieId]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading movie...
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-white">
        <p className="text-lg text-red-400">
          {error}
        </p>

        <Link
          to="/"
          className="mt-6 rounded-md bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }


  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "N/A";

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "N/A";


  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="relative min-h-[520px] overflow-hidden">
        {movie.backdrop_url && (
          <img
            src={movie.backdrop_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-end md:px-12 md:py-16">
          <div className="w-48 shrink-0 sm:w-56 md:w-64">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={`${movie.title} poster`}
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                No poster
              </div>
            )}
          </div>

          <div className="max-w-3xl">
            <Link
              to="/"
              className="mb-5 inline-block text-sm text-zinc-300 hover:text-white"
            >
              ← Back to movies
            </Link>

            <h1 className="text-4xl font-bold sm:text-5xl">
              {movie.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-300">
              <span>{releaseYear}</span>
              <span>•</span>
              <span>{runtime}</span>
              <span>•</span>
              <span>
                ★ {movie.vote_average.toFixed(1)}
              </span>
              <span>
                ({movie.vote_count.toLocaleString()} votes)
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
                >
                  {genre}
                </span>
              ))}
            </div>

            <h2 className="mt-8 text-xl font-semibold">
              Overview
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
              {movie.overview || "No overview available."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-12">
        <h2 className="mb-6 text-2xl font-bold">
          Cast
        </h2>

        {movie.cast.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {movie.cast.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-lg bg-zinc-900"
              >
                <div className="aspect-[2/3] bg-zinc-800">
                  {member.profile_url ? (
                    <img
                      src={member.profile_url}
                      alt={member.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-500">
                      No photo
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-sm font-semibold">
                    {member.name}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    {member.character || "Unknown role"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">
            Cast information is unavailable.
          </p>
        )}
      </section>
    </div>
  );
}


export default MovieDetails;