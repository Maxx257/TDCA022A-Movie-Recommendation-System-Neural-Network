import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
} from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";


function Admin() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movieAnalytics, setMovieAnalytics] = useState([]);


  useEffect(() => {
    const loadStats = async () => {
      if (authLoading) {
        return;
      }

      if (!user?.is_admin) {
        setLoading(false);
        return;
      }

      try {
        const [
          statsResponse,
          analyticsResponse,
        ] = await Promise.all([
          apiClient.get("/admin/stats"),

          apiClient.get(
            "/admin/movies/analytics",
            {
              params: {
                limit: 10,
              },
            }
          ),
        ]);

        setStats(statsResponse.data);


        const movieRequests =
          analyticsResponse.data.results.map(
            async (item) => {
              try {
                const movieResponse =
                  await apiClient.get(
                    `/movies/${item.movie_id}`
                  );

                return {
                  ...item,
                  movie: movieResponse.data,
                };
              } catch {
                return {
                  ...item,
                  movie: null,
                };
              }
            }
          );


        const movies =
          await Promise.all(
            movieRequests
          );


        setMovieAnalytics(
          movies.filter(
            (item) => item.movie
          )
        );

      } catch (err) {
        console.error(
          "Could not load admin statistics:",
          err
        );

        setError(
          "Could not load dashboard statistics."
        );

      } finally {
        setLoading(false);
      }
    };


    loadStats();

  }, [user, authLoading]);


  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Loading dashboard...
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


  if (!user.is_admin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  const cards = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users,
        },
        {
          label: "Favourites",
          value: stats.total_favourites,
        },
        {
          label: "Watchlist Items",
          value: stats.total_watchlist_items,
        },
        {
          label: "Ratings",
          value: stats.total_ratings,
        },
        {
          label: "Viewed Movies",
          value: stats.total_viewed_movies,
        },
        {
          label: "Total Views",
          value: stats.total_views,
        },
        {
          label: "Average Rating",
          value:
            stats.average_rating !== null
              ? stats.average_rating.toFixed(2)
              : "N/A",
        },
      ]
    : [];


  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 lg:px-16">

        <Link
          to="/"
          className="inline-flex items-center text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Home
        </Link>


        {/* Heading */}
        <div className="mt-10 max-w-3xl">

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Administration
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Overview of platform activity, movie interactions
            and recommendation model performance.
          </p>

        </div>


        {/* Error */}
        {error && (
          <div className="mt-8 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">

            <p className="text-sm text-red-300">
              {error}
            </p>

          </div>
        )}


        {/* Stats */}
        {stats && (
          <section className="mt-12">

            <div className="mb-7">

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                Platform Overview
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                Activity Summary
              </h2>

            </div>


            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
                >

                  <p className="text-3xl font-semibold tracking-tight text-white">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-zinc-500">
                    {card.label}
                  </p>

                </div>
              ))}

            </div>

          </section>
        )}


        {/* Model Insights */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">

              <div className="max-w-2xl">

                <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                  Machine Learning
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
                  Model Insights
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  View the neural recommendation model, dataset
                  statistics, prediction errors, Top-10 evaluation
                  metrics and model comparisons.
                </p>

              </div>


              <Link
                to="/admin/model-insights"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                View Model Insights
                <span className="ml-2">
                  →
                </span>
              </Link>

            </div>


            <div className="mt-7 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Model
                </p>

                <p className="mt-2 text-sm font-medium text-white">
                  NeuMF V2
                </p>
              </div>


              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Framework
                </p>

                <p className="mt-2 text-sm font-medium text-white">
                  TensorFlow / Keras
                </p>
              </div>


              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Evaluation
                </p>

                <p className="mt-2 text-sm font-medium text-white">
                  MAE · RMSE · HR@10 · NDCG · MRR
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* Movie analytics */}
        {movieAnalytics.length > 0 && (
          <section className="mt-16 border-t border-white/5 pt-14">

            <div className="mb-8">

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
                Analytics
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white sm:text-3xl">
                Movie Analytics
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Movies with the highest activity across the platform.
              </p>

            </div>


            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-zinc-500">

                    <tr>

                      <th className="px-5 py-4 font-medium">
                        Movie
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Favourites
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Watchlist
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Ratings
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Views
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Total
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {movieAnalytics.map(
                      (item, index) => (
                        <tr
                          key={item.movie_id}
                          className="border-t border-white/5 transition hover:bg-white/[0.03]"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-4">

                              <span className="w-5 text-xs text-zinc-600">
                                {index + 1}
                              </span>


                              {item.movie.poster_url && (
                                <img
                                  src={
                                    item.movie.poster_url
                                  }
                                  alt={
                                    item.movie.title
                                  }
                                  className="h-16 w-11 rounded-md object-cover shadow-md shadow-black/30"
                                />
                              )}


                              <div className="min-w-0">

                                <p className="truncate font-medium text-white">
                                  {item.movie.title}
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                  {item.movie.year ||
                                    "Unknown year"}
                                </p>

                              </div>

                            </div>

                          </td>


                          <td className="px-4 py-4 text-zinc-300">
                            {item.favourites}
                          </td>

                          <td className="px-4 py-4 text-zinc-300">
                            {item.watchlist}
                          </td>

                          <td className="px-4 py-4 text-zinc-300">
                            {item.ratings}
                          </td>

                          <td className="px-4 py-4 text-zinc-300">
                            {item.views}
                          </td>

                          <td className="px-4 py-4">

                            <span className="inline-flex min-w-10 justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
                              {item.total_interactions}
                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}


        {/* Administrator info */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Account
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
              Administrator
            </h2>


            <div className="mt-6 grid gap-5 text-sm sm:grid-cols-3">

              <div>

                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Username
                </p>

                <p className="mt-2 text-zinc-200">
                  {user.username}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Email
                </p>

                <p className="mt-2 text-zinc-200">
                  {user.email}
                </p>

              </div>


              <div>

                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Role
                </p>

                <p className="mt-2 font-medium text-white">
                  Administrator
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


export default Admin;