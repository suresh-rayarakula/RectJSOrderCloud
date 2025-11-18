// src/pages/Products.tsx
import { useEffect, useState } from "react";
import { listProducts, type Product } from "../api/products";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getOrCreateOrder, addLineItem } from "../api/cart";
import { useCart } from "../context/CartContext"; // ← This is the key!

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const navigate = useNavigate();
  const { addToCart } = useCart(); // ← Use global cart!

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await listProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
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

      // Update global cart context (this updates header badge instantly!)
      addToCart(productID, productName);

      setMessage({
        text: `${productName} added to cart!`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({
        text: "Failed to add to cart",
        type: "error",
      });
    }
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
            top: 80,
            right: 20,
            background: message.type === "success" ? "#1DB954" : "#d32f2f",
            color: "white",
            padding: "14px 24px",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 9999,
            animation: "slideInRight 0.4s ease",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>All Products</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "28px",
          }}
        >
          {products.map((p) => (
            <div
              key={p.ID}
              style={{
                border: "1px solid #333",
                borderRadius: "16px",
                padding: "24px",
                backgroundColor: "#141414",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(100, 108, 255, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1.5rem", color: "white" }}>
                {p.Name}
              </h3>

              <p style={{ color: "#aaa", margin: "12px 0", lineHeight: 1.5 }}>
                {p.Description || "Premium quality product"}
              </p>

              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link
                  to={`/products/${p.ID}`}
                  style={{
                    color: "#646cff",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "15px",
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
                    padding: "14px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}