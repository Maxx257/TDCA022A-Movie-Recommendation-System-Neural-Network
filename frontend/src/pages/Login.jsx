import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

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
              Welcome Back
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-white">
              Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Continue your personalized movie experience.
            </p>
          </div>


          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500"
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
                placeholder="Username or email"
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
                placeholder="Enter password"
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


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting
                ? "Logging in..."
                : "Login"}
            </button>

          </form>


          <div className="mt-7 border-t border-white/10 pt-6">

            <p className="text-center text-sm text-zinc-500">
              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-medium text-white transition hover:text-zinc-300"
              >
                Register
              </Link>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Login;