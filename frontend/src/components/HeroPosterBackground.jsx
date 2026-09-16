import { useEffect, useMemo, useState } from "react";

import apiClient from "../api/client";


function HeroPosterBackground() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    const loadMovies = async () => {
      try {
        const response = await apiClient.get(
          "/movies/popular"
        );

        const results =
          response.data.results ||
          response.data ||
          [];

        const usableMovies = results.filter(
          (movie) =>
            movie.backdrop_url ||
            movie.poster_url
        );

        setMovies(
          usableMovies.slice(0, 10)
        );
      } catch (error) {
        console.error(
          "Could not load hero movies:",
          error
        );
      }
    };

    loadMovies();
  }, []);


  useEffect(() => {
    if (movies.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(
        (previous) =>
          (previous + 1) % movies.length
      );
    }, 6000);

    return () =>
      clearInterval(interval);
  }, [movies]);


  const displayMovies = useMemo(
    () => movies,
    [movies]
  );


  if (displayMovies.length === 0) {
    return (
      <div className="absolute inset-0 h-full w-full bg-zinc-950" />
    );
  }


  return (
    <div
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
      aria-hidden="true"
    >

      {displayMovies.map(
        (movie, index) => {
          const image =
            movie.backdrop_url ||
            movie.poster_url;

          return (
            <div
              key={movie.id}
              className={`absolute inset-0 h-full w-full transition-opacity duration-[1800ms] ease-in-out ${
                index === currentIndex
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-black/20" />
            </div>
          );
        }
      )}


      {/* Keeps text readable while preserving the movie artwork */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/5" />


      {/* Soft cinematic fade from the navigation */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />


      {/* Blends the hero naturally into the homepage */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/15 to-transparent" />


      {/* Very subtle vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.35)]" />

    </div>
  );
}


export default HeroPosterBackground;