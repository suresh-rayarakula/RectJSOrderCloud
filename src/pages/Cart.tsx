// src/pages/Cart.tsx  ← Replace the entire file with this (only change is safer orderID handling)

import { useEffect, useState } from "react";
import {
  listLineItems,
  updateLineItem,
  deleteLineItem,
  submitOrder,
  getOrCreateOrder,
} from "../api/cart";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { orderID, setOrderID, replaceCartItems } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadCart() {
    setLoading(true);

    let currentOrderID = orderID || localStorage.getItem("oc_active_order_id");

    if (!currentOrderID) {
      const order = await getOrCreateOrder();
      currentOrderID = order.ID;
      setOrderID(order.ID);   // ← This ensures context + localStorage are in sync
    }

    const lineItems = await listLineItems(currentOrderID??'');

    replaceCartItems(
      lineItems.map((li: any) => ({
        id: li.Product.ID,
        name: li.Product.Name,
        qty: li.Quantity,
      }))
    );

    setItems(lineItems);
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateQty(li: any, newQty: number) {
    // ← CRITICAL: Always use the real orderID (never null)
    const oid = orderID || localStorage.getItem("oc_active_order_id");
    if (!oid) {
      alert("Cart error: No order found. Please refresh.");
      return;
    }

    if (newQty < 1) {
      await deleteLineItem(oid, li.ID);
    } else {
      await updateLineItem(oid, li.ID, newQty, li.Product.ID);
    }
    await loadCart();   // refresh UI + badge
  }

async function handleCheckout() {
  try {
    const oid = orderID || localStorage.getItem("oc_active_order_id");
    if (!oid) {
      alert("No order to submit");
      return;
    }

    await submitOrder(oid);

    // ← THIS IS WHAT WAS MISSING
    alert("Order submitted successfully! 🎉");

    // Clean everything up
    localStorage.removeItem("oc_active_order_id");
    setOrderID(null);
    replaceCartItems([]);
    setItems([]);
    navigate("/products");
  } catch (err) {
    alert("Checkout failed. Please try again.");
  }
}

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading cart...</div>;

  const isEmpty = items.length === 0;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Your Cart</h1>

      {isEmpty ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Your cart is empty</h2>
          <Link to="/products" style={{ color: "#646cff" }}>Continue Shopping →</Link>
        </div>
      ) : (
        <>
          {items.map((li) => (
            <div
              key={li.ID}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.5rem",
                borderBottom: "1px solid #444",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{li.Product.Name}</h3>
                <p style={{ color: "#aaa" }}>${(li.UnitPrice || 0).toFixed(2)} each</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button onClick={() => updateQty(li, li.Quantity - 1)}>-</button>
                <span style={{ minWidth: 50, textAlign: "center", fontWeight: "bold" }}>
                  {li.Quantity}
                </span>
                <button onClick={() => updateQty(li, li.Quantity + 1)}>+</button>
                <button
                  onClick={() => updateQty(li, 0)}
                  style={{ background: "#d32f2f", color: "white", border: "none", padding: "8px 16px" }}
                >
                  Remove
                </button>
              </div>

              <strong>${(li.LineTotal || 0).toFixed(2)}</strong>
            </div>
          ))}

          <div style={{ textAlign: "right", marginTop: "3rem" }}>
            <button
              onClick={handleCheckout}
              style={{
                background: "#07b107",
                color: "white",
                fontSize: "1.4rem",
                padding: "1rem 2.5rem",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              Submit Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}