import axios from "axios";
import { getToken } from "./auth";

const apiUrl = import.meta.env.VITE_ORDERCLOUD_API_URL;

export interface Product {
  ID: string;
  Name: string;
  Description?: string;
}

export async function listProducts(): Promise<Product[]> {
  const token = getToken();

  const res = await axios.get(`${apiUrl}/v1/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.Items;
}