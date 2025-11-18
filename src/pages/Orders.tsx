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

      {orders.map((order) => (
        <div
          key={order.ID}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <h4>Order #{order.ID}</h4>
          <p>Status: {order.Status}</p>
          <p>Total: ${order.Total?.toFixed(2) || "0.00"}</p>
          <p>Created: {(new Date(order.DateCreated)).toLocaleString()}</p>

          <Link
            to={`/orders/${order.ID}`}
            style={{ color: "#0078ff" }}
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  );
}
