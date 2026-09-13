import { Link } from "react-router-dom";


function MovieCard({ movie }) {
  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "N/A";

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block overflow-hidden rounded-lg bg-zinc-900 transition hover:-translate-y-1 hover:bg-zinc-800"
    >
      <div className="aspect-[2/3] overflow-hidden bg-zinc-800">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
            No poster available
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold text-white">
          {movie.title}
        </h3>

        <div className="mt-2 flex items-center justify-between text-sm text-zinc-400">
          <span>{releaseYear}</span>
          <span>★ {movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}


export default MovieCard;