// src/components/Header.tsx
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { logout } from "../api/auth";

export default function Header() {
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header
      style={{
        background: "#0f0f1aff",
        position: "fixed",      // ← Sticks to very top
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
        borderBottom: "1px solid #222",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "1.5rem 3rem",   // ← Generous side padding
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo - Left */}
        <Link to="/products" style={{ textDecoration: "none" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "2.8rem",
              fontWeight: "900",
              background: "linear-gradient(90deg, #646cff, #ee4e73ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "1px",
            }}
          >
            React OrderCloud
          </h3>
        </Link>

        {/* Nav Links - Right with HUGE breathing space */}
        <nav style={{ display: "flex", alignItems: "center", gap: "5rem" }}>
          <Link
            to="/products"
            style={{
              color: isActive("/products") ? "#646cff" : "#e0e0e0",
              fontSize: "1.2rem",
              fontWeight: "600",
              textDecoration: "none",
              padding: "8px 0",
              borderBottom: isActive("/products") ? "3px solid #646cff" : "3px solid transparent",
              transition: "all 0.3s ease",
            }}
          >
            Products
          </Link>

          <Link
            to="/orders"
            style={{
              color: isActive("/orders") ? "#646cff" : "#e0e0e0",
              fontSize: "1.2rem",
              fontWeight: "600",
              textDecoration: "none",
              padding: "8px 0",
              borderBottom: isActive("/orders") ? "3px solid #646cff" : "3px solid transparent",
              transition: "all 0.3s ease",
            }}
          >
            My Orders
          </Link>

          <Link
            to="/cart"
            style={{
              position: "relative",
              color: "#fff",
              fontSize: "1.3rem",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              🛒 Cart
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-14px",
                    right: "-26px",
                    background: "#ff2d55",
                    color: "white",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    minWidth: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid #0f0f1a",
                    boxShadow: "0 4px 15px rgba(255,45,85,0.6)",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </span>
          </Link>

          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "2px solid #646cff",
              color: "#646cff",
              padding: "12px 32px",
              borderRadius: "16px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#646cff";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#646cff";
            }}
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}