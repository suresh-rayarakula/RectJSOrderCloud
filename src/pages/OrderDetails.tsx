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
    <div style={{ padding: 20 }}>
      <h2>Order #{order.ID}</h2>

      <p>Status: {order.Status}</p>
      <p>Total: ${order.Total?.toFixed(2)}</p>
      <p>Created On: {(new Date(order.DateCreated)).toLocaleString()}</p>

      <h3>Items</h3>
      {items.map((li) => (
        <div key={li.ID} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
          <h4>{li.Product?.Name}</h4>
          <p>Quantity: {li.Quantity}</p>
          <p>Unit Price: ${li.UnitPrice}</p>
        </div>
      ))}
    </div>
  );
}
