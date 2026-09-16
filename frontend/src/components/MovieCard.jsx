import { Link } from "react-router-dom";


function MovieCard({ movie }) {
  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "N/A";

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-lg shadow-black/20 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-black/40">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
            No poster available
          </div>
        )}

        {/* Subtle cinematic hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>


      {/* Movie information */}
      <div className="pt-3">
        <h3 className="truncate text-[15px] font-medium tracking-tight text-zinc-100 transition group-hover:text-white">
          {movie.title}
        </h3>

        <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {releaseYear}
          </span>

          <span className="flex items-center gap-1 text-zinc-400">
            <span className="text-yellow-400">
              ★
            </span>

            {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}


export default MovieCard;