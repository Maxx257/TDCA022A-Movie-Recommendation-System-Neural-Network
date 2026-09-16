import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "./api/client";
import { useAuth } from "./context/AuthContext";

import MovieCard from "./components/MovieCard";
import RecentlyViewed from "./components/RecentlyViewed";
import TopPicks from "./components/TopPicks";
import BecauseYouLiked from "./components/BecauseYouLiked";
import NeuralRecommendations from "./components/NeuralRecommendations";
import HeroPosterBackground from "./components/HeroPosterBackground";


function App() {
  const { user, logout } = useAuth();

  const [movies, setMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState("");


  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const response = await apiClient.get(
          "/movies/popular"
        );

        setMovies(response.data.results);
      } catch (error) {
        console.error(error);

        setMoviesError(
          "Could not load movies."
        );
      } finally {
        setMoviesLoading(false);
      }
    };

    loadPopularMovies();
  }, []);


  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Navigation */}
      <header className="sticky top-0 z-50 h-20 border-b border-white/5 bg-zinc-950/85 backdrop-blur-xl">

        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-6 px-6 md:px-12 lg:px-16">

          <Link
            to="/"
            className="min-w-0"
          >
            <h1 className="truncate text-lg font-semibold tracking-[-0.025em] text-white md:text-xl">
              Movie Recommendation System
            </h1>
          </Link>


          <nav className="flex shrink-0 items-center gap-4">

            <Link
              to="/"
              className="hidden text-sm text-zinc-400 transition hover:text-white sm:block"
            >
              Home
            </Link>


            <Link
              to="/browse"
              className="hidden text-sm text-zinc-400 transition hover:text-white sm:block"
            >
              Browse
            </Link>


            <Link
              to="/search"
              className="hidden text-sm text-zinc-400 transition hover:text-white md:block"
            >
              Search
            </Link>


            {user ? (
              <>

                <Link
                  to="/my-list"
                  className="hidden text-sm text-zinc-400 transition hover:text-white md:block"
                >
                  Favourites
                </Link>


                <Link
                  to="/watchlist"
                  className="hidden text-sm text-zinc-400 transition hover:text-white md:block"
                >
                  Watchlist
                </Link>


                <Link
                  to="/profile"
                  className="hidden text-sm text-zinc-400 transition hover:text-white md:block"
                >
                  {user.username}
                </Link>


                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="hidden text-sm text-zinc-400 transition hover:text-white md:block"
                  >
                    Admin
                  </Link>
                )}


                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Logout
                </button>

              </>
            ) : (
              <>

                <Link
                  to="/login"
                  className="text-sm text-zinc-400 transition hover:text-white"
                >
                  Login
                </Link>


                <Link
                  to="/register"
                  className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Register
                </Link>

              </>
            )}

          </nav>

        </div>

      </header>


      {/* Hero */}
      <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden">

        <HeroPosterBackground />


        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-6 md:px-12 lg:px-16">

          <div className="max-w-3xl">

            <p className="mb-6 text-xs font-medium uppercase tracking-[0.35em] text-zinc-300 md:text-sm">
              Neural Network Powered Recommendations
            </p>


            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Discover movies

              <span className="block">
                made for you.
              </span>
            </h1>


            <p className="mt-7 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              Personalized picks based on what you like.
            </p>


            <div className="mt-9 flex flex-wrap gap-3">

              <Link
                to="/browse"
                className="rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:text-base"
              >
                Explore Movies
              </Link>


              {user ? (
                <a
                  href="#ai-picks"
                  className="rounded-lg border border-white/20 bg-black/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10 sm:text-base"
                >
                  View My AI Picks
                </a>
              ) : (
                <Link
                  to="/register"
                  className="rounded-lg border border-white/20 bg-black/30 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10 sm:text-base"
                >
                  Get Started
                </Link>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* AI recommendations */}
      <div id="ai-picks">
        <NeuralRecommendations />
      </div>


      <TopPicks />

      <BecauseYouLiked />

      <RecentlyViewed />


      {/* Popular Movies */}
      <section className="border-t border-white/5 px-6 py-16 md:px-16 lg:px-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8 max-w-3xl">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Explore More
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
              Popular Movies
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Popular movies currently available from TMDB.
            </p>

          </div>


          {moviesLoading && (
            <p className="text-sm text-zinc-500">
              Loading movies...
            </p>
          )}


          {moviesError && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">

              <p className="text-sm text-red-300">
                {moviesError}
              </p>

            </div>
          )}


          {!moviesLoading &&
            !moviesError && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}

              </div>
            )}

        </div>

      </section>

    </div>
  );
}


export default App;