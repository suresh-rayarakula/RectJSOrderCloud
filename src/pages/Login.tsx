import { useState } from "react";
import { login, getCurrentUser } from "../api/auth";
import type { MeUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState<MeUser | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(username, password);
      const me = await getCurrentUser();
      setUserInfo(me);
      setError("");

      // ✅ Redirect to products page
      navigate("/products");

    } catch {
      setError("Invalid credentials, please try again.");
    }
  }

  return (
    <div style={{ margin: "40px", maxWidth: "360px" }}>
      <h2>Login to ReactCommerce</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
