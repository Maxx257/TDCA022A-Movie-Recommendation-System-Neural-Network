import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";


function Profile() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [stats, setStats] = useState({
    favourites: 0,
    watchlist: 0,
    ratings: 0,
    viewed: 0,
  });

    const [loading, setLoading] = useState(true);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [recentRatings, setRecentRatings] = useState([]);


  useEffect(() => {
    const loadProfileStats = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [
          favouritesResponse,
          watchlistResponse,
          ratingsResponse,
          historyResponse,
        ] = await Promise.all([
          apiClient.get("/favorites"),
          apiClient.get("/watchlist"),
          apiClient.get("/ratings"),
          apiClient.get("/history"),
        ]);

        setStats({
          favourites:
            favouritesResponse.data.length,

          watchlist:
            watchlistResponse.data.length,

          ratings:
            ratingsResponse.data.length,

          viewed:
            historyResponse.data.length,
        });

        const recentHistoryItems =
  historyResponse.data.slice(0, 6);

const recentRatingItems =
  ratingsResponse.data
    .slice()
    .sort((a, b) => {
      const aDate =
        a.updated_at || a.created_at;

      const bDate =
        b.updated_at || b.created_at;

      return new Date(bDate) - new Date(aDate);
    })
    .slice(0, 6);

    const historyMovieRequests =
  recentHistoryItems.map(
    async (item) => {
      const response = await apiClient.get(
        `/movies/${item.movie_id}`
      );

      return {
        movie: response.data,
        viewCount: item.view_count,
      };
    }
  );

const ratingMovieRequests =
  recentRatingItems.map(
    async (item) => {
      const response = await apiClient.get(
        `/movies/${item.movie_id}`
      );

      return {
        movie: response.data,
        rating: item.rating,
      };
    }
  );

  const [
  historyMovieResponses,
  ratingMovieResponses,
] = await Promise.all([
  Promise.allSettled(
    historyMovieRequests
  ),
  Promise.allSettled(
    ratingMovieRequests
  ),
]);

setRecentlyViewed(
  historyMovieResponses
    .filter(
      (result) =>
        result.status === "fulfilled"
    )
    .map(
      (result) => result.value
    )
);

setRecentRatings(
  ratingMovieResponses
    .filter(
      (result) =>
        result.status === "fulfilled"
    )
    .map(
      (result) => result.value
    )
);

      } catch (error) {
        console.error(
          "Could not load profile statistics:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfileStats();
  }, [user, authLoading]);


  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading profile...
      </div>
    );
  }


  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
        <h1 className="text-3xl font-bold">
          Profile
        </h1>

        <p className="mt-3 text-zinc-400">
          Log in to view your profile.
        </p>

        <Link
          to="/login"
          className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700"
        >
          Login
        </Link>
      </div>
    );
  }


  const initial =
    user.username?.charAt(0).toUpperCase()
    || "U";


  const statCards = [
    {
      label: "Favourites",
      value: stats.favourites,
      link: "/my-list",
    },
    {
      label: "Watchlist",
      value: stats.watchlist,
      link: "/watchlist",
    },
    {
      label: "Ratings",
      value: stats.ratings,
      link: null,
    },
    {
      label: "Movies Viewed",
      value: stats.viewed,
      link: null,
    },
  ];


  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-12">

        <Link
          to="/"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to Home
        </Link>


        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-red-600 text-4xl font-bold">
              {initial}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-red-500">
                Your Profile
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                {user.username}
              </h1>

              <p className="mt-2 text-zinc-400">
                {user.email}
              </p>
            </div>

          </div>
        </section>


        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Your Activity
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            A summary of your movie activity.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {statCards.map((card) => {
              const content = (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700">
                  <p className="text-3xl font-bold">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    {card.label}
                  </p>
                </div>
              );

              return card.link ? (
                <Link
                  key={card.label}
                  to={card.link}
                >
                  {content}
                </Link>
              ) : (
                <div key={card.label}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>

{recentlyViewed.length > 0 && (
  <section className="mt-12">
    <div className="mb-6">
      <h2 className="text-2xl font-bold">
        Recently Viewed
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Movies you recently explored.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {recentlyViewed.map(
        ({ movie, viewCount }) => (
          <div key={movie.id}>
            <MovieCard
              movie={movie}
            />

            <p className="mt-2 text-xs text-zinc-500">
              Viewed {viewCount}{" "}
              {viewCount === 1
                ? "time"
                : "times"}
            </p>
          </div>
        )
      )}
    </div>
  </section>
)}

{recentRatings.length > 0 && (
  <section className="mt-12">
    <div className="mb-6">
      <h2 className="text-2xl font-bold">
        Recent Ratings
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Movies you recently rated.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {recentRatings.map(
        ({ movie, rating }) => (
          <div key={movie.id}>
            <MovieCard
              movie={movie}
            />

            <p className="mt-2 text-sm font-semibold text-yellow-400">
              Your rating: ★ {rating.toFixed(1)}
            </p>
          </div>
        )
      )}
    </div>
  </section>
)}

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Quick Links
          </h2>

          <div className="mt-5 flex flex-wrap gap-4">
            <Link
              to="/my-list"
              className="rounded-lg bg-zinc-800 px-5 py-3 font-semibold transition hover:bg-zinc-700"
            >
              ♥ My Favourites
            </Link>

            <Link
              to="/watchlist"
              className="rounded-lg bg-zinc-800 px-5 py-3 font-semibold transition hover:bg-zinc-700"
            >
              + My Watchlist
            </Link>

            <Link
              to="/preferences"
              className="rounded-lg bg-zinc-800 px-5 py-3 font-semibold transition hover:bg-zinc-700"
            >
              Update Preferences
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}


export default Profile;