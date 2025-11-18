import axios from "axios";
import { getToken } from "./auth";

const baseUrl = import.meta.env.VITE_ORDERCLOUD_API_URL as string;

// List all submitted orders for logged in user
export async function listOrders() {
  const res = await axios.get(
    `${baseUrl}/v1/orders/outgoing`,
    {
      params: {
        // Only show submitted orders
        filters: "Status=Open|Completed"
      },
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  );
  return res.data.Items;
}

// Get a single order
export async function getOrder(orderID: string) {
  const res = await axios.get(
    `${baseUrl}/v1/orders/outgoing/${orderID}`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return res.data;
}

// Get line items for a given order
export async function getOrderLineItems(orderID: string) {
  const res = await axios.get(
    `${baseUrl}/v1/orders/outgoing/${orderID}/lineitems`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return res.data.Items;
}
