import React, { createContext, useState, useContext, useEffect } from "react";
import * as api from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user data when token exists
  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  const loadUserProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const query = `
        query {
          userProfile {
            id
            email
            name
          }
        }
      `;

      const response = await api.graphqlQuery(query, token);
      if (response.data && response.data.userProfile) {
        setUser(response.data.userProfile);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // If token is invalid, clear it
      if (error.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.login(email, password);

      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);

        // Set user data from login response
        if (data.user) {
          setUser(data.user);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem("token");
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
