import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import apiClient from "../api/client";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/auth/me");
        setUser(response.data);
      } catch {
        sessionStorage.removeItem("access_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);


  const login = async (identifier, password) => {
    const response = await apiClient.post("/auth/login", {
      identifier,
      password,
    });

    sessionStorage.setItem(
      "access_token",
      response.data.access_token
    );

    const userResponse = await apiClient.get("/auth/me");

    setUser(userResponse.data);

    return userResponse.data;
  };


  const logout = () => {
    sessionStorage.removeItem("access_token");
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}