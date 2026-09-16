import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";


function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      await apiClient.post(
        "/auth/register",
        formData
      );

      await login(
        formData.username,
        formData.password
      );

      setSuccess(
        "Account created successfully."
      );

      setTimeout(() => {
        navigate("/preferences");
      }, 800);
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-12 text-white">

      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl" />
      </div>


      <div className="relative z-10 w-full max-w-md">

        <Link
          to="/"
          className="inline-flex text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to Home
        </Link>


        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Get Started
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white">
              Create account
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Create your profile to receive personalized movie recommendations.
            </p>
          </div>


          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
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
                placeholder="Enter username"
                className="w-full rounded-lg border border-white/10 bg-zinc-900/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-white/30 focus:ring-2 focus:ring-white/5"
              />
            </div>


            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
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
                placeholder="Enter email"
                className="w-full rounded-lg border border-white/10 bg-zinc-900/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-white/30 focus:ring-2 focus:ring-white/5"
              />
            </div>


            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
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
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-white/10 bg-zinc-900/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-white/30 focus:ring-2 focus:ring-white/5"
              />
            </div>


            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
                <p className="text-sm text-red-300">
                  {error}
                </p>
              </div>
            )}


            {success && (
              <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3">
                <p className="text-sm text-emerald-300">
                  {success}
                </p>
              </div>
            )}


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>


          <div className="mt-7 border-t border-white/10 pt-6">

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}

              <Link
                to="/login"
                className="font-medium text-white transition hover:text-zinc-300"
              >
                Login
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Register;