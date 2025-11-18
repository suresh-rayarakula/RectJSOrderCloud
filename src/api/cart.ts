// src/api/cart.ts
import axios from "axios";
import {
  getToken,
  getCurrentUser,
  setUserLocale,
  // setBuyerLocale,
  type MeUser,
} from "./auth";

const baseUrl = import.meta.env.VITE_ORDERCLOUD_API_URL as string;
const ORDER_KEY = "oc_active_order_id";
const BUYER_ID = "react_buyers"; // Hardcode or fetch dynamically

export async function addLineItem(orderID: string, productID: string) {
  try {
    const res = await axios.post(
      `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems`,
      { ProductID: productID, Quantity: 1 },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return res.data;
  } catch (err: any) {
    console.error(
      "Add line item error:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
}

export async function createOrder() {
  const user: MeUser | null = await getCurrentUser();
  if (!user || !user.CompanyID || !user.ID) {
    throw new Error(
      "Unable to create order: current user or buyer info missing."
    );
  }

  // Attempt to set locale to match USD (requires admin access)
  try {
    await setUserLocale("en-US");
    //await setBuyerLocale(BUYER_ID, "en-US");
  } catch (err) {
    console.warn(
      "Locale update failed, proceeding with current settings:",
      err
    );
  }

  const res = await axios.post(
    `${baseUrl}/v1/orders/outgoing`,
    {
      FromCompanyID: user.CompanyID,
      FromUserID: user.ID,
    },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );

  const order = res.data;
  if (order && order.ID) {
    localStorage.setItem(ORDER_KEY, order.ID);
  }
  return order;
}

export async function getOrCreateOrder(): Promise<any> {
  const existing = localStorage.getItem(ORDER_KEY);
  
  if (existing) {
    try {
      const res = await axios.get(`${baseUrl}/v1/orders/outgoing/${existing}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      // If order is already submitted, don't reuse it
      if (res.data.Status === "Completed" || res.data.IsSubmitted) {
        localStorage.removeItem(ORDER_KEY);
        return createOrder();
      }
      
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        localStorage.removeItem(ORDER_KEY);
      }
    }
  }
  
  return createOrder();
}

export function clearCachedOrder() {
  localStorage.removeItem(ORDER_KEY);
}
// -----------------------------
// Get All Items in Cart
// -----------------------------
export async function listLineItems(orderID: string) {
  const res = await axios.get(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );

  return res.data.Items;
}

// Update Quantity
// -----------------------------
// src/api/cart.ts
export async function updateLineItem(
  orderID: string,
  lineItemID: string,
  qty: number,
  productID: string  // ← Add this parameter
) {
  const res = await axios.put(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems/${lineItemID}`,
    {
      Quantity: qty,
      ProductID: productID,  // ← This fixes the validation error
    },
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  return res.data;
}

// -----------------------------
// Remove Item
// -----------------------------
export async function deleteLineItem(orderID: string, lineItemID: string) {
  await axios.delete(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems/${lineItemID}`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
}

// -----------------------------
// Checkout (Submit Order) + CLEAR CART
// -----------------------------
export async function submitOrder(orderID: string) {
  try {
    const res = await axios.post(
      `${baseUrl}/v1/orders/outgoing/${orderID}/submit`,
      {},
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );

    // CRITICAL: Clear the active order from localStorage after submit
    localStorage.removeItem(ORDER_KEY);

    return res.data;
  } catch (err: any) {
    console.error("Submit order failed:", err.response?.data);
    throw err;
  }
}
