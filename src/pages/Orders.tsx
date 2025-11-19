import { useEffect, useState } from "react";
import { listOrders } from "../api/orders";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const data = await listOrders();
      setOrders(data);
      setLoading(false);
    }
    loadOrders();
  }, []);

  if (loading) return <h3>Loading orders...</h3>;

  return (
    <div style={{ padding: 20 }}>
      <h2>My Orders</h2>

      {orders.length === 0 && (
        <p>You don’t have any past orders.</p>
      )}

      {orders.length > 0 && (
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "18px",
          background: "#181828",
          color: "white",
          borderRadius: "10px",
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ background: "#232344" }}>
              <th style={{ padding: "14px", borderBottom: "2px solid #353569", textAlign: "left" }}>Order #</th>
              <th style={{ padding: "14px", borderBottom: "2px solid #353569", textAlign: "left" }}>Status</th>
              <th style={{ padding: "14px", borderBottom: "2px solid #353569", textAlign: "right" }}>Total</th>
              <th style={{ padding: "14px", borderBottom: "2px solid #353569", textAlign: "left" }}>Created</th>
              <th style={{ padding: "14px", borderBottom: "2px solid #353569", textAlign: "left" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.ID} style={{ borderBottom: "1px solid #29294c" }}>
                <td style={{ padding: "12px" }}>{order.ID}</td>
                <td style={{ padding: "12px" }}>{order.Status}</td>
                <td style={{ padding: "12px", textAlign: "right" }}>${order.Total?.toFixed(2) || "0.00"}</td>
                <td style={{ padding: "12px" }}>{(new Date(order.DateCreated)).toLocaleString()}</td>
                <td style={{ padding: "12px" }}>
                  <Link
                    to={`/orders/${order.ID}`}
                    style={{
                      color: "#7a7fff",
                      textDecoration: "underline"
                    }}
                  >
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
