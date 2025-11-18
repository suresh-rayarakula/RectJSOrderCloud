import { useEffect, useState } from "react";
import {
  listLineItems,
  updateLineItem,
  deleteLineItem,
  submitOrder,
  createOrder,
} from "../api/cart";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { orderID, setOrderID } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadCart() {
    let currentOrder = orderID;

    if (!currentOrder) {
      const order = await createOrder();
      currentOrder = order?.ID;
      setOrderID(order.ID);
    }

    const lineItems = await listLineItems(currentOrder ?? "");
    setItems(lineItems);
    setLoading(false);
  }

  async function updateQty(li: any, qty: number) {
  if (qty < 1) {
    // Optionally delete instead of going to 0
    await removeItem(li);
    return;
  }

  try {
    await updateLineItem(orderID!, li.ID, qty, li.Product.ID);
    loadCart(); // Refresh items
  } catch (err) {
    console.error("Failed to update quantity:", err);
    alert("Could not update quantity. Try again.");
    loadCart();
  }
}

  async function removeItem(li: any) {
    await deleteLineItem(orderID!, li.ID);
    loadCart();
  }

async function handleCheckout() {
  try {
    await submitOrder(orderID!);
    alert("Order submitted successfully!");
    
    // Clear from context
    setOrderID(null);

    // Optional: force reload cart state
    setItems([]);

    navigate("/products");
  } catch (err) {
    alert("Failed to submit order. Please try again.");
  }
}

  useEffect(() => {
    loadCart();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Loading cart...</h3>
      </div>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <div >
      <h1 >Your Cart</h1>

      {isEmpty ? (
        /* ========== EMPTY CART STATE ========== */
        <div
          
        >
          <div >Empty Cart</div>
          <h2>
            Your cart is currently empty
          </h2>
          <p >
            Looks like you haven't added anything yet.
          </p>

          <Link
            to="/products"
            
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        /* ========== CART WITH ITEMS ========== */
        <>
          {items.map((li) => (
            <div
              key={li.ID}
              style={{
                border: "1px solid #444",
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 8px" }}>{li.Product.Name}</h3>
                <p style={{ color: "#ccc" }}>
                  ${(li.UnitPrice || 0).toFixed(2)} each
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => updateQty(li, li.Quantity - 1)}
                  style={{ width: 40, height: 40, fontSize: 20 }}
                >
                  −
                </button>
                <span style={{ minWidth: 40, textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
                  {li.Quantity}
                </span>
                <button
                  onClick={() => updateQty(li, li.Quantity + 1)}
                  style={{ width: 40, height: 40, fontSize: 20 }}
                >
                  +
                </button>

                <button
                  onClick={() => removeItem(li)}
                  style={{
                    marginLeft: 20,
                    background: "#d32f2f",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: 8,
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                ${(li.LineTotal || 0).toFixed(2)}
              </div>
            </div>
          ))}

          <div style={{ textAlign: "right", marginTop: 40 }}>
            <button
              onClick={handleCheckout}
              style={{
                background: "#07b107",
                color: "white",
                fontSize: "1.3rem",
                fontWeight: "bold",
                padding: "16px 20px",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(7, 177, 7, 0.4)",
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