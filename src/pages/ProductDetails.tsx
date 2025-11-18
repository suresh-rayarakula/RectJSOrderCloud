// src/pages/ProductDetails.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getToken, setUserLocale } from "../api/auth";
import { addLineItem, getOrCreateOrder } from "../api/cart";
import { useCart } from "../context/CartContext";

interface Product {
  ID: string;
  Name: string;
  Description?: string;
  DefaultPriceScheduleID?: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await axios.get<Product>(
          `${import.meta.env.VITE_ORDERCLOUD_API_URL}/v1/products/${id}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  async function handleAddToCart() {
  if (!product) return alert("Product not loaded.");
  try {
    const order = await getOrCreateOrder();
    await addLineItem(order.ID, product.ID);
    addToCart(product.ID, product.Name, 1);
    alert(`${product.Name} added to cart!`);
  } catch (err: any) {
    // Existing error handling
  }
}

  if (loading) return <h3>Loading product...</h3>;
  if (error || !product) return <p style={{ color: "red" }}>{error || "Product not found"}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{product.Name}</h2>
      <p>{product.Description}</p>
      <button
        style={{
          marginTop: 20,
          backgroundColor: "#0078ff",
          color: "white",
          padding: "8px 16px",
          borderRadius: 6,
          border: "none",
          cursor: product ? "pointer" : "not-allowed",
          opacity: product ? 1 : 0.5,
        }}
        onClick={handleAddToCart}
        disabled={!product}
      >
        Add to Cart
      </button>
    </div>
  );
}