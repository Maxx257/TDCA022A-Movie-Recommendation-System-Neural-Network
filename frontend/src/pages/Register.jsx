import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import apiClient from "../api/client";


function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setIsSubmitting(true);

    try {
      await apiClient.post("/auth/register", formData);

      setSuccess("Account created successfully.");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to create account. Please try again.";

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

        <h1 className="text-3xl font-bold">Create account</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Create your profile to receive personalized movie recommendations.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={50}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-red-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-red-500"
              placeholder="Enter email"
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
              maxLength={128}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 outline-none transition focus:border-red-500"
              placeholder="Minimum 8 characters"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-md bg-green-950 p-3 text-sm text-green-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}


export default Register;