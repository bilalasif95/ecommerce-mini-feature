import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password123");
  const [localError, setLocalError] = useState("");
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear errors when component mounts or inputs change
  useEffect(() => {
    clearError();
    setLocalError("");
  }, [email, password, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }

    if (!password.trim()) {
      setLocalError("Password is required");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    setLocalError("");

    const success = await login(email, password);
    if (success) {
      navigate("/");
    }
  };

  const displayError = localError || error;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "50px auto",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#2c3e50",
        }}
      >
        Login
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#2c3e50",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#bdc3c7" : "#3498db",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {displayError && (
          <div
            style={{
              color: "#e74c3c",
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fdf2f2",
              border: "1px solid #fecaca",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {displayError}
          </div>
        )}
      </form>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#666",
        }}
      >
        <strong>Demo Credentials:</strong>
        <br />
        Email: user@example.com
        <br />
        Password: password123
      </div>
    </div>
  );
}
