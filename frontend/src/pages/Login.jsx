import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login(
        formData.identifier,
        formData.password
      );

      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to login. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <Link
          to="/"
          className="mb-8 inline-block text-sm text-zinc-400 hover:text-white"
        >
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Login to continue your personalized movie experience.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="identifier"
              className="mb-2 block text-sm font-medium"
            >
              Username or Email
            </label>

            <input
              id="identifier"
              name="identifier"
              type="text"
              value={formData.identifier}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-red-500"
              placeholder="Username or email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-red-500"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-red-500 hover:text-red-400"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}


export default Login;