import axios from "axios";

const baseUrl = import.meta.env.VITE_ORDERCLOUD_API_URL;
const clientId = import.meta.env.VITE_ORDERCLOUD_CLIENT_ID;

export async function login(username: string, password: string): Promise<string> {
  const data = new URLSearchParams();
  data.append("grant_type", "password");
  data.append("client_id", clientId);
  data.append("username", username);
  data.append("password", password);

  const response = await axios.post(`${baseUrl}/oauth/token`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  localStorage.setItem("access_token", response.data.access_token);
  return response.data.access_token;
}

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export interface MeUser {
  ID: string;
  Username: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
}

export async function getCurrentUser(): Promise<MeUser | null> {
  const token = getToken();
  if (!token) return null;

  const response = await axios.get<MeUser>(`${baseUrl}/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}