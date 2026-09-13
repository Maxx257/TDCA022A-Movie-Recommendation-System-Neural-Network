import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "./api/client";
import MovieCard from "./components/MovieCard";


function App() {
  const { user, logout } = useAuth();

const [movies, setMovies] = useState([]);
const [moviesLoading, setMoviesLoading] = useState(true);
const [moviesError, setMoviesError] = useState("");
useEffect(() => {
  const loadPopularMovies = async () => {
    try {
      const response = await apiClient.get("/movies/popular");

      setMovies(response.data.results);
    } catch (error) {
      console.error(error);
      setMoviesError("Could not load movies.");
    } finally {
      setMoviesLoading(false);
    }
  };

  loadPopularMovies();
}, []);
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-5 md:px-12">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Movie Recommendation System
        </h1>

        <nav className="flex items-center gap-4">
  <a
    href="#"
    className="hidden text-sm text-zinc-300 hover:text-white sm:block"
  >
    Home
  </a>

  <Link
  to="/search"
  className="hidden text-sm text-zinc-300 transition hover:text-white md:block"
>
  Search
</Link>

  {user ? (
    <>
      <span className="text-sm text-zinc-300">
        {user.username}
      </span>

      <button
        onClick={logout}
        className="rounded-md bg-zinc-800 px-5 py-2 text-sm font-semibold transition hover:bg-zinc-700"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link
        to="/login"
        className="text-sm text-zinc-300 hover:text-white"
      >
        Login
      </Link>

      <Link
        to="/register"
        className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold transition hover:bg-red-700"
      >
        Register
      </Link>
    </>
  )}
</nav>
      </header>

      <main className="flex min-h-[calc(100vh-81px)] items-center px-6 py-16 md:px-16 lg:px-24">
        <section className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-red-500 sm:text-sm">
            NEURAL NETWORK POWERED RECOMMENDATIONS
          </p>

          <h2 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Discover movies made for you.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Browse movies, save your favourites and receive personalized
            recommendations based on your interests.
          </p>

          <div className="mt-8 flex gap-3">
            <Link
              to="/register"
              className="rounded-md bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
            >
              Get Started
            </Link>

            <button className="rounded-md bg-zinc-800 px-6 py-3 font-semibold transition hover:bg-zinc-700">
              Learn More
            </button>
          </div>
        </section>
      </main>
      <section className="px-6 pb-16 md:px-16 lg:px-24">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold sm:text-3xl">
        Popular Movies
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Popular movies currently available from TMDB.
      </p>
    </div>
  </div>

  {moviesLoading && (
    <p className="text-zinc-400">
      Loading movies...
    </p>
  )}

  {moviesError && (
    <p className="rounded-md bg-red-950 p-4 text-red-300">
      {moviesError}
    </p>
  )}

  {!moviesLoading && !moviesError && (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
        />
      ))}
    </div>
  )}
</section>
    </div>
  );
}


export default App;