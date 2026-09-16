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

              return (
                new Date(bDate) -
                new Date(aDate)
              );
            })
            .slice(0, 6);


        const historyMovieRequests =
          recentHistoryItems.map(
            async (item) => {
              const response =
                await apiClient.get(
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
              const response =
                await apiClient.get(
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Loading profile...
      </div>
    );
  }


  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center text-white">

        <div className="max-w-md">

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Profile
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white">
            Your Profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Log in to view your profile.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Login
          </Link>

        </div>

      </div>
    );
  }


  const initial =
    user.username
      ?.charAt(0)
      .toUpperCase() || "U";


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

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 lg:px-16">

        <Link
          to="/"
          className="inline-flex items-center text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Home
        </Link>


        {/* Profile header */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white text-3xl font-semibold text-black shadow-xl shadow-black/20">
              {initial}
            </div>


            <div>

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                Your Profile
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
                {user.username}
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                {user.email}
              </p>

            </div>

          </div>

        </section>


        {/* Activity */}
        <section className="mt-12">

          <div className="mb-7">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Overview
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
              Your Activity
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              A summary of your movie activity.
            </p>

          </div>


          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {statCards.map((card) => {
              const content = (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]">

                  <p className="text-3xl font-semibold tracking-tight text-white">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
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


        {/* Recently viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mt-16 border-t border-white/5 pt-14">

            <div className="mb-8">

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                Your History
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
                Recently Viewed
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Movies you recently explored.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

              {recentlyViewed.map(
                ({
                  movie,
                  viewCount,
                }) => (
                  <div key={movie.id}>

                    <MovieCard
                      movie={movie}
                    />

                    <p className="mt-2.5 text-xs text-zinc-600">
                      Viewed{" "}
                      {viewCount}{" "}
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


        {/* Recent ratings */}
        {recentRatings.length > 0 && (
          <section className="mt-16 border-t border-white/5 pt-14">

            <div className="mb-8">

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                Your Ratings
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
                Recent Ratings
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Movies you recently rated.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

              {recentRatings.map(
                ({
                  movie,
                  rating,
                }) => (
                  <div key={movie.id}>

                    <MovieCard
                      movie={movie}
                    />

                    <p className="mt-2.5 text-xs text-zinc-400">
                      Your rating{" "}
                      <span className="font-medium text-yellow-400">
                        ★ {rating.toFixed(1)}
                      </span>
                    </p>

                  </div>
                )
              )}

            </div>

          </section>
        )}


        {/* Quick links */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div>

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Shortcuts
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              Quick Links
            </h2>

          </div>


          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              to="/my-list"
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
            >
              ♡ My Favourites
            </Link>

            <Link
              to="/watchlist"
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
            >
              + My Watchlist
            </Link>

            <Link
              to="/preferences"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
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