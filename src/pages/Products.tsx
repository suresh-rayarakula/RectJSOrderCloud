// src/pages/Products.tsx (or wherever your file is)
import { useEffect, useState } from "react";
import { listProducts, type Product } from "../api/products";
import { getCurrentUser, type MeUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getOrCreateOrder, addLineItem, listLineItems } from "../api/cart";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  // Fetch products + user
  useEffect(() => {
    async function fetchData() {
      try {
        const [data, userData] = await Promise.all([listProducts(), getCurrentUser()]);
        setProducts(data);
        setUser(userData);

        // Load cart count on mount
        const order = await getOrCreateOrder();
        const items = await listLineItems(order.ID);
        const totalItems = items.reduce((sum: number, li: any) => sum + li.Quantity, 0);
        setCartCount(totalItems);
      } catch (err) {
        console.error("Initial load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [message]);

  async function handleAddToCart(productID: string, productName: string) {
    try {
      const order = await getOrCreateOrder();
      await addLineItem(order.ID, productID);

      // Update cart count
      setCartCount(prev => prev + 1);

      // Show success message
      setMessage({
        text: `${productName} added to cart!`,
        type: "success"
      });
    } catch (err: any) {
      setMessage({
        text: "Failed to add to cart",
        type: "error"
      });
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("oc_active_order_id");
    navigate("/");
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontSize: "1.5rem" }}>
        Loading products...
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {message && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: message.type === "success" ? "#1DB954" : "#d32f2f",
            color: "white",
            padding: "14px 24px",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 9999,
            minWidth: "240px",
            textAlign: "center",
            animation: "slideInRight 0.4s ease",
          }}
        >
          {message.type === "success" ? "Success" : "Error"} {message.text}
        </div>
      )}

      <div style={{ padding: "30px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "1.1rem" }}>
                  Hello, <strong>{user.FirstName} {user.LastName}</strong>
                </span>
                <button onClick={logout}>Logout</button>
              </div>
            ) : (
              <button onClick={logout}>Logout</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link to="/cart" style={{ textDecoration: "none", color: "#646cff", fontWeight: 500 }}>
              Cart ({cartCount})
            </Link>
            <br></br>
          </div>
         
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {products.map((p) => (
            <div
              key={p.ID}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "rgba(255,255,255,0.05)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1.4rem" }}>
                {p.Name}
              </h3>

              <p style={{ color: "#aaa", fontSize: "0.95rem", margin: "8px 0 16px" }}>
                {p.Description || "No description"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  to={`/products/${p.ID}`}
                  style={{
                    color: "#646cff",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  See details →
                </Link>

                <button
                  onClick={() => handleAddToCart(p.ID, p.Name || "Item")}
                  style={{
                    backgroundColor: "#646cff",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#535bf2")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#646cff")}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}