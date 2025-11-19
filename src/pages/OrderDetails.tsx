import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrder, getOrderLineItems } from "../api/orders";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const o = await getOrder(id!);
      const li = await getOrderLineItems(id!);
      setOrder(o);
      setItems(li);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <h3>Loading order...</h3>;

  return (
    <div style={{ padding: 32 }}>
      <div
        style={{
          background: "rgba(32, 32, 48, 0.92)",
          padding: "2rem 2rem 1.2rem 2rem",
          borderRadius: "18px",
          marginBottom: "26px",
          boxShadow: "0 8px 30px rgba(80, 88, 255, 0.13)",
          color: "white"
        }}>
        <h2 style={{
          fontSize: "2rem",
          marginBottom: "0.8rem",
          background: "linear-gradient(90deg,#7377ff,#a78bff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Order #{order.ID}
        </h2>
        <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
          <div>
            <span style={{ color: "#aaa" }}>Status:</span> <span style={{ color: "#ffe680" }}>{order.Status}</span>
          </div>
          <div>
            <span style={{ color: "#aaa" }}>Total:</span>{" "}
            <span style={{ color: "#95fdab" }}>${order.Total?.toFixed(2)}</span>
          </div>
          <div>
            <span style={{ color: "#aaa" }}>Created On:</span>{" "}
            <span>{(new Date(order.DateCreated)).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{
        background: "rgba(24,24,40,0.94)",
        borderRadius: "14px",
        padding: "1.5rem",
        boxShadow: "0 4px 16px rgba(120,128,255,.07)"
      }}>
        <h3 style={{
          marginBottom: "1rem",
          color: "#a7abff",
          letterSpacing: "1px"
        }}>Items</h3>
        {items.length === 0 ? (
          <p style={{ color: "#aaa" }}>No items in this order.</p>
        ) : (
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "transparent",
            color: "white"
          }}>
            <thead>
              <tr style={{ background: "#232344" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #313163" }}>Product</th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #313163" }}>Quantity</th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #313163" }}>Unit Price</th>
                <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #313163" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((li) => (
                <tr key={li.ID} style={{ borderBottom: "1px solid #29294c" }}>
                  <td style={{ padding: "12px" }}>{li.Product?.Name ?? "—"}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>{li.Quantity}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>${li.UnitPrice}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    ${((li.Quantity ?? 0) * (li.UnitPrice ?? 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
