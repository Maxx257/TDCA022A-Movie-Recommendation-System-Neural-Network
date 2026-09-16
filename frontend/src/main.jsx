import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import Search from "./pages/Search.jsx";
import Browse from "./pages/Browse.jsx";
import MyList from "./pages/MyList.jsx";
import Preferences from "./pages/Preferences.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import ModelInsights from "./pages/ModelInsights.jsx";


createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>

        <Routes>

          <Route
            path="/"
            element={<App />}
          />

          <Route
            path="/browse"
            element={<Browse />}
          />

          <Route
            path="/search"
            element={<Search />}
          />

          <Route
            path="/movies/:movieId"
            element={<MovieDetails />}
          />

          <Route
            path="/my-list"
            element={<MyList />}
          />

          <Route
            path="/watchlist"
            element={<Watchlist />}
          />

          <Route
            path="/preferences"
            element={<Preferences />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/admin"
            element={<Admin />}
          />

          <Route
            path="/admin/model-insights"
            element={<ModelInsights />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);