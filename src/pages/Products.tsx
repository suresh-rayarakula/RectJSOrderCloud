// src/pages/Products.tsx
import { useEffect, useState } from "react";
import { listProducts, type Product } from "../api/products";
import { Link } from "react-router-dom";
import { getOrCreateOrder, addLineItem } from "../api/cart";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await listProducts();
        setProducts(data);
      } catch (err) {
        setMessage({ text: "Failed to load products", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
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
      addToCart(productID, productName);

      setMessage({
        text: `${productName} added to cart!`,
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: "Failed to add to cart",
        type: "error",
      });
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", fontSize: "1.6rem", color: "#aaa" }}>
        Loading products...
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      {message && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 20,
            background: message.type === "success" ? "#1DB954" : "#d32f2f",
            color: "white",
            padding: "14px 28px",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 9999,
            animation: "slideInRight 0.4s ease",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "2.4rem", marginBottom: "3rem", textAlign: "center", color: "#646cff" }}>
          All Products
        </h2>

        {/* 2-Column Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",   // ← Exactly 2 columns
            gap: "2.5rem",
            padding: "0 1rem",
          }}
          className="products-grid"
        >
          {products.map((p) => (
            <div
              key={p.ID}
              style={{
                border: "1px solid #333",
                borderRadius: "18px",
                padding: "28px",
                backgroundColor: "#141414",
                transition: "all 0.3s ease",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(100, 108, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
              }}
            >
              <h3 style={{ margin: "0 0 14px 0", fontSize: "1.7rem", color: "white" }}>
                {p.Name}
              </h3>

              <p style={{ color: "#bbb", margin: "14px 0", lineHeight: "1.6", fontSize: "1rem" }}>
                {p.Description || "Premium quality product"}
              </p>

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <Link
                  to={`/products/${p.ID}`}
                  style={{
                    color: "#646cff",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  See details →
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(p.ID, p.Name || "Item");
                  }}
                  style={{
                    background: "linear-gradient(135deg, #646cff, #535bf2)",
                    color: "white",
                    border: "none",
                    padding: "16px",
                    borderRadius: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive fallback for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr !important;
            padding: 0 1rem;
          }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}