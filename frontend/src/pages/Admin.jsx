import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";


function Admin() {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


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
        const response = await apiClient.get(
          "/admin/stats"
        );

        setStats(response.data);
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading dashboard...
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }


  if (!user.is_admin) {
    return <Navigate to="/" replace />;
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
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">

        <Link
          to="/"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to Home
        </Link>


        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-red-500">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Overview of platform activity and user interactions.
          </p>
        </div>


        {error && (
          <div className="mt-8 rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}


        {stats && (
          <section className="mt-10">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

              {cards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <p className="text-3xl font-bold">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    {card.label}
                  </p>
                </div>
              ))}

            </div>
          </section>
        )}


        <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-xl font-bold">
            Administrator
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <p className="text-zinc-400">
              Username:
              <span className="ml-2 text-white">
                {user.username}
              </span>
            </p>

            <p className="text-zinc-400">
              Email:
              <span className="ml-2 text-white">
                {user.email}
              </span>
            </p>

            <p className="text-zinc-400">
              Role:
              <span className="ml-2 font-semibold text-red-500">
                Administrator
              </span>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}


export default Admin;