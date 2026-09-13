import { Link } from "react-router-dom";


function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-5 md:px-12">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Movie Recommendation System
        </h1>

        <nav className="flex items-center gap-5">
          <a
            href="#"
            className="hidden text-sm text-zinc-300 hover:text-white sm:block"
          >
            Home
          </a>

          <a
            href="#"
            className="hidden text-sm text-zinc-300 hover:text-white sm:block"
          >
            Browse
          </a>

          <a
            href="#"
            className="hidden text-sm text-zinc-300 hover:text-white md:block"
          >
            My List
          </a>

          <Link
            to="/register"
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold transition hover:bg-red-700"
          >
            Register
          </Link>
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
    </div>
  );
}


export default App;