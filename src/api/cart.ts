// src/api/cart.ts   ← REPLACE YOUR ENTIRE FILE WITH THIS

import axios from "axios";
import { getToken } from "./auth";

const baseUrl = import.meta.env.VITE_ORDERCLOUD_API_URL as string;
const ORDER_KEY = "oc_active_order_id";

export async function addLineItem(orderID: string, productID: string) {
  const res = await axios.post(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems`,
    { ProductID: productID, Quantity: 1 },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return res.data;
}

export async function getOrCreateOrder(): Promise<any> {
  const existing = localStorage.getItem(ORDER_KEY);
  if (existing) {
    try {
      const res = await axios.get(`${baseUrl}/v1/orders/outgoing/${existing}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.data.Status === "Completed" || res.data.IsSubmitted) {
        localStorage.removeItem(ORDER_KEY);
        return createOrder();
      }
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 404) localStorage.removeItem(ORDER_KEY);
    }
  }
  return createOrder();
}

async function createOrder(): Promise<any> {
  const userRes = await axios.get(`${baseUrl}/v1/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const user = userRes.data;

  const res = await axios.post(
    `${baseUrl}/v1/orders/outgoing`,
    { FromCompanyID: user.CompanyID, FromUserID: user.ID },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );

  const order = res.data;
  if (order.ID) localStorage.setItem(ORDER_KEY, order.ID);
  return order;
}

export async function listLineItems(orderID: string) {
  const res = await axios.get(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return res.data.Items || [];
}

// ──────────────────────────────
// THIS WAS THE BUG (missing ProductID)
// ──────────────────────────────
export async function updateLineItem(
  orderID: string,
  lineItemID: string,
  qty: number,
  productID: string          // ← REQUIRED by OrderCloud
) {
  await axios.put(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems/${lineItemID}`,
    {
      Quantity: qty,
      ProductID: productID,   // ← THIS LINE WAS MISSING BEFORE!
    },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
}

export async function deleteLineItem(orderID: string, lineItemID: string) {
  await axios.delete(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems/${lineItemID}`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
}

export async function submitOrder(orderID: string) {
  const res = await axios.post(
    `${baseUrl}/v1/orders/outgoing/${orderID}/submit`,
    {},
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  localStorage.removeItem(ORDER_KEY);
  return res.data;
}