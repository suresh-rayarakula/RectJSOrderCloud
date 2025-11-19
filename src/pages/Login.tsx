// src/pages/Login.tsx
import { useState } from "react";
import { login, getCurrentUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      await getCurrentUser();
      navigate("/products");
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: "rgba(20, 20, 30, 0.95)",
          padding: "3rem 2.5rem",
          borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(100, 108, 255, 0.2)",
          border: "1px solid #333",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            fontSize: "2.4rem",
            fontWeight: "800",
            background: "linear-gradient(90deg, #646cff, #a78bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 0.5rem 0",
          }}
        >
          React Commerce
        </h1>
        <p style={{ color: "#aaa", fontSize: "1.05rem", marginBottom: "2rem" }}>
           Please login to continue
        </p>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              padding: "1rem 1.2rem",
              fontSize: "1.05rem",
              background: "#1f1f2e",
              border: "1px solid #444",
              borderRadius: "12px",
              color: "white",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "1rem 1.2rem",
              fontSize: "1.05rem",
              background: "#1f1f2e",
              border: "1px solid #444",
              borderRadius: "12px",
              color: "white",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #646cff, #535bf2)",
              color: "white",
              padding: "1.1rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && (
          <p style={{ color: "#ff6b6b", marginTop: "1.5rem", fontSize: "0.95rem" }}>
            {error}
          </p>
        )}
        <p style={{ color: "#777", fontSize: "0.9rem", marginTop: "2rem" }}>
          Demo: <strong>buyer</strong> / <strong>password</strong>
        </p>
      </div>
    </div>
  );
}
