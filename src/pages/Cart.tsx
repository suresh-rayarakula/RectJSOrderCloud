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
      setOrderID(order.ID);
    }
    const lineItems = await listLineItems(currentOrderID ?? '');
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
    await loadCart();
  }

  async function handleCheckout() {
    try {
      const oid = orderID || localStorage.getItem("oc_active_order_id");
      if (!oid) {
        alert("No order to submit");
        return;
      }
      await submitOrder(oid);
      alert("Order submitted successfully! 🎉");
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
  const cartTotal = items.reduce((sum, li) => sum + (li.LineTotal || 0), 0);

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{
        fontSize: "2rem",
        marginBottom: "16px",
        background: "linear-gradient(90deg,#7377ff,#a7abff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>Your Cart</h1>
      {isEmpty ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Your cart is empty</h2>
          <Link to="/products" style={{ color: "#646cff" }}>Continue Shopping →</Link>
        </div>
      ) : (
        <>
          <div style={{
            borderRadius: "11px",
            overflow: "hidden",
            boxShadow: "0 4px 28px rgba(100,108,255,0.08)",
            background: "rgba(32,32,48,0.95)",
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "white",
              background: "transparent",
            }}>
              <thead>
                <tr style={{ background: "#232344" }}>
                  <th style={{ padding: "14px", textAlign: "left" }}>Product</th>
                  <th style={{ padding: "14px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "14px", textAlign: "center" }}>Quantity</th>
                  <th style={{ padding: "14px", textAlign: "right" }}>Total</th>
                  <th style={{ padding: "14px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((li) => (
                  <tr key={li.ID} style={{ borderBottom: "1px solid #29294c" }}>
                    <td style={{ padding: "12px", fontWeight: 600 }}>{li.Product.Name}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>${(li.UnitPrice || 0).toFixed(2)}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => updateQty(li, li.Quantity - 1)}
                        style={{
                          background: "#353569",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0 10px",
                          fontSize: "1rem",
                          cursor: "pointer",
                          marginRight: "6px"
                        }}
                      >-</button>
                      <span style={{
                        minWidth: 32,
                        display: "inline-block",
                        fontWeight: "bold"
                      }}>{li.Quantity}</span>
                      <button
                        onClick={() => updateQty(li, li.Quantity + 1)}
                        style={{
                          background: "#353569",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0 10px",
                          fontSize: "1rem",
                          cursor: "pointer",
                          marginLeft: "6px"
                        }}
                      >+</button>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>${(li.LineTotal || 0).toFixed(2)}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => updateQty(li, 0)}
                        style={{
                          background: "#d32f2f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "7px 14px",
                          cursor: "pointer"
                        }}
                      >Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            textAlign: "right",
            marginTop: "2.5rem",
            marginBottom: "1.5rem"
          }}>
            <div style={{
              background: "rgba(5,82,47,0.92)",
              display: "inline-block",
              padding: "1.2rem 2.7rem",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "1.2rem",
              color: "#a2fcb6",
              boxShadow: "0 2px 16px rgba(7,177,7,0.09)"
            }}>
              Cart Total: ${cartTotal.toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
            <button
              onClick={handleCheckout}
              style={{
                background: "linear-gradient(135deg, #409040, #07b107)",
                color: "white",
                fontSize: "1.3rem",
                padding: "1rem 2.5rem",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 2px 12px rgba(7,177,7,0.09)"
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
