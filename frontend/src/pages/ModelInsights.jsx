import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
} from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";


function ModelInsights() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadInsights = async () => {
      if (authLoading) {
        return;
      }

      if (!user?.is_admin) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(
          "/admin/model-insights"
        );

        setInsights(response.data);
      } catch (error) {
        console.error(
          "Could not load model insights:",
          error
        );

        setError(
          "Could not load model insights."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [user, authLoading]);


  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
        Loading model insights...
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


  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-10 text-white">

        <div className="mx-auto max-w-7xl">

          <Link
            to="/admin"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            ← Back to Admin
          </Link>

          <div className="mt-10 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>

        </div>

      </div>
    );
  }


  if (!insights) {
    return null;
  }


  const {
    model,
    dataset,
    performance,
    previous_model: previousModel,
    baselines,
    explanation,
    selection_note: selectionNote,
  } = insights;


  const percentage = (value) =>
    `${(value * 100).toFixed(2)}%`;


  const comparisonRows = [
    ...baselines,
    {
      name: previousModel.name,
      mae: previousModel.mae,
      rmse: previousModel.rmse,
    },
    {
      name: model.name,
      mae: performance.mae,
      rmse: performance.rmse,
      selected: true,
    },
  ];


  const qualityMetrics = [
    {
      label: "Hit Rate @10",
      value: performance.hit_rate_at_10,
      formatted: percentage(
        performance.hit_rate_at_10
      ),
      description:
        explanation.hit_rate_at_10,
    },
    {
      label: "NDCG @10",
      value: performance.ndcg_at_10,
      formatted: percentage(
        performance.ndcg_at_10
      ),
      description:
        explanation.ndcg_at_10,
    },
    {
      label: "MRR",
      value: performance.mrr,
      formatted: percentage(
        performance.mrr
      ),
      description:
        explanation.mrr,
    },
  ];


  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 lg:px-16">

        <Link
          to="/admin"
          className="inline-flex text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Admin Dashboard
        </Link>


        {/* Header */}
        <div className="mt-10 max-w-4xl">

          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Machine Learning
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            Model Insights
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Performance, dataset statistics and evaluation
            results for the neural recommendation model.
          </p>

        </div>


        {/* Model information */}
        <section className="mt-12">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>

                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  Selected Model
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  {model.name}
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                  {model.type}
                </p>

              </div>


              <div className="flex flex-wrap gap-2">

                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
                  {model.framework}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
                  {model.embedding_dimension}D Embeddings
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
                  {model.selection_status}
                </span>

              </div>

            </div>


            <p className="mt-7 max-w-4xl border-t border-white/10 pt-6 text-sm leading-6 text-zinc-400">
              {selectionNote}
            </p>

          </div>

        </section>


        {/* Dataset */}
        <section className="mt-16">

          <div className="mb-7">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Dataset
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              Training Data
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {dataset.name} dataset using a{" "}
              {dataset.split_strategy.toLowerCase()} split.
            </p>

          </div>


          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {[
              {
                label: "Users",
                value: dataset.users.toLocaleString(),
              },
              {
                label: "Movies",
                value: dataset.movies.toLocaleString(),
              },
              {
                label: "Ratings",
                value: dataset.ratings.toLocaleString(),
              },
              {
                label: "Embedding Size",
                value: `${model.embedding_dimension}D`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-3xl font-semibold tracking-tight text-white">
                  {item.value}
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  {item.label}
                </p>
              </div>
            ))}

          </div>


          <div className="mt-4 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-2xl font-semibold text-white">
                {dataset.training_ratings.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Training Ratings
              </p>
            </div>


            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-2xl font-semibold text-white">
                {dataset.validation_ratings.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Validation Ratings
              </p>
            </div>


            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-2xl font-semibold text-white">
                {dataset.test_ratings.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Test Ratings
              </p>
            </div>

          </div>

        </section>


        {/* Prediction metrics */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div className="mb-7">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Model Performance
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              Rating Prediction Error
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Lower values indicate better rating predictions.
            </p>

          </div>


          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                MAE
              </p>

              <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {performance.mae.toFixed(4)}
              </p>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                {explanation.mae}
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                RMSE
              </p>

              <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {performance.rmse.toFixed(4)}
              </p>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                {explanation.rmse}
              </p>

            </div>

          </div>

        </section>


        {/* Recommendation quality */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div className="mb-7">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Recommendation Quality
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              Top-10 Evaluation
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Ranking metrics measure how effectively the model
              recommends relevant movies.
            </p>

          </div>


          <div className="grid gap-4 lg:grid-cols-3">

            {qualityMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >

                <div className="flex items-end justify-between gap-3">

                  <p className="text-sm font-medium text-zinc-300">
                    {metric.label}
                  </p>

                  <p className="text-2xl font-semibold text-white">
                    {metric.formatted}
                  </p>

                </div>


                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: `${Math.min(
                        metric.value * 100,
                        100
                      )}%`,
                    }}
                  />

                </div>


                <p className="mt-5 text-sm leading-6 text-zinc-500">
                  {metric.description}
                </p>

              </div>
            ))}

          </div>

        </section>


        {/* Neural model comparison */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div className="mb-7">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Neural Models
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              NeuMF V2 vs NCF V1
            </h2>

          </div>


          <div className="overflow-hidden rounded-2xl border border-white/10">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-zinc-500">

                  <tr>
                    <th className="px-5 py-4 font-medium">
                      Model
                    </th>

                    <th className="px-4 py-4 font-medium">
                      MAE
                    </th>

                    <th className="px-4 py-4 font-medium">
                      RMSE
                    </th>

                    <th className="px-4 py-4 font-medium">
                      Hit Rate @10
                    </th>

                    <th className="px-4 py-4 font-medium">
                      NDCG @10
                    </th>

                    <th className="px-4 py-4 font-medium">
                      MRR
                    </th>
                  </tr>

                </thead>


                <tbody>

                  <tr className="border-t border-white/5">

                    <td className="px-5 py-4 text-zinc-300">
                      {previousModel.name}
                    </td>

                    <td className="px-4 py-4 text-zinc-400">
                      {previousModel.mae.toFixed(4)}
                    </td>

                    <td className="px-4 py-4 text-zinc-400">
                      {previousModel.rmse.toFixed(4)}
                    </td>

                    <td className="px-4 py-4 text-zinc-400">
                      {percentage(
                        previousModel.hit_rate_at_10
                      )}
                    </td>

                    <td className="px-4 py-4 text-zinc-400">
                      {percentage(
                        previousModel.ndcg_at_10
                      )}
                    </td>

                    <td className="px-4 py-4 text-zinc-400">
                      {percentage(
                        previousModel.mrr
                      )}
                    </td>

                  </tr>


                  <tr className="border-t border-white/10 bg-white/[0.04]">

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <span className="font-semibold text-white">
                          {model.name}
                        </span>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
                          Selected
                        </span>

                      </div>

                    </td>

                    <td className="px-4 py-4 font-medium text-white">
                      {performance.mae.toFixed(4)}
                    </td>

                    <td className="px-4 py-4 font-medium text-white">
                      {performance.rmse.toFixed(4)}
                    </td>

                    <td className="px-4 py-4 font-medium text-white">
                      {percentage(
                        performance.hit_rate_at_10
                      )}
                    </td>

                    <td className="px-4 py-4 font-medium text-white">
                      {percentage(
                        performance.ndcg_at_10
                      )}
                    </td>

                    <td className="px-4 py-4 font-medium text-white">
                      {percentage(
                        performance.mrr
                      )}
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </section>


        {/* Baseline comparison */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div className="mb-7">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Evaluation
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              Model Comparison
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              Comparison against simpler recommendation baselines.
            </p>

          </div>


          <div className="overflow-hidden rounded-2xl border border-white/10">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-zinc-500">

                  <tr>
                    <th className="px-5 py-4 font-medium">
                      Model
                    </th>

                    <th className="px-5 py-4 font-medium">
                      MAE
                    </th>

                    <th className="px-5 py-4 font-medium">
                      RMSE
                    </th>
                  </tr>

                </thead>


                <tbody>

                  {comparisonRows.map((row) => (
                    <tr
                      key={row.name}
                      className={
                        row.selected
                          ? "border-t border-white/10 bg-white/[0.04]"
                          : "border-t border-white/5"
                      }
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <span
                            className={
                              row.selected
                                ? "font-semibold text-white"
                                : "text-zinc-300"
                            }
                          >
                            {row.name}
                          </span>


                          {row.selected && (
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">
                              Selected
                            </span>
                          )}

                        </div>

                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        {row.mae.toFixed(4)}
                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        {row.rmse.toFixed(4)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </section>


        {/* Accuracy note */}
        <section className="mt-16 border-t border-white/5 pt-14">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Understanding the Results
            </p>

            <h2 className="mt-3 text-xl font-semibold text-white">
              Why there is no single “accuracy” score
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-400">
              This system predicts ratings and ranks movie
              recommendations rather than classifying items into
              correct or incorrect categories. Therefore, MAE and
              RMSE measure rating prediction error, while Hit Rate,
              NDCG and MRR measure recommendation quality.
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}


export default ModelInsights;