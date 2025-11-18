import axios from "axios";

const baseUrl = import.meta.env.VITE_ORDERCLOUD_API_URL;
const clientId = import.meta.env.VITE_ORDERCLOUD_CLIENT_ID;
const BUYER_ID = "react_buyers"; // Replace with dynamic fetch if needed

export async function login(
  username: string,
  password: string
): Promise<string> {
  const data = new URLSearchParams();
  data.append("grant_type", "password");
  data.append("client_id", clientId);
  data.append("username", username);
  data.append("password", password);

  try {
    const response = await axios.post(`${baseUrl}/oauth/token`, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem("access_token", response.data.access_token);
    console.log("Login successful, token stored");
    return response.data.access_token;
  } catch (err: any) {
    console.error("Login failed:", err.response?.data);
    throw new Error("Login failed: Check credentials or network.");
  }
}

export function getToken(): string | null {
  const token = localStorage.getItem("access_token");
  if (token) console.log("Token retrieved from storage");
  return token;
}

export interface MeUser {
  ID: string;
  Username: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  CompanyID?: string;
  Locale?:
    | string
    | { ID: string; Currency: string; Language: string; OwnerID: string };
}

export async function getCurrentUser(): Promise<MeUser | null> {
  const token = getToken();
  if (!token) {
    console.warn("No token available for getCurrentUser");
    return null;
  }

  try {
    const response = await axios.get<MeUser>(`${baseUrl}/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const locale = response.data.Locale;
    console.log(
      "Current user locale:",
      typeof locale === "object" ? locale : { ID: locale }
    );
    return response.data;
  } catch (err: any) {
    console.error("Failed to get current user:", err.response?.data);
    return null;
  }
}

// Optional: Set user locale (requires admin access, skip if already set)
export async function setUserLocale(locale: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No token available");

  const user = await getCurrentUser();
  if (user && user.ID && user.CompanyID) {
    const currentLocale = user.Locale;
    if (typeof currentLocale === "object" && currentLocale.ID === locale) {
      console.log(`Locale ${locale} already set, skipping update`);
      return; // Skip if locale matches
    }

    try {
      await axios.patch(
        `${baseUrl}/v1/buyers/${user.CompanyID}/users/${user.ID}`,
        { Locale: locale },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`User locale updated to ${locale}`);
    } catch (err: any) {
      console.error(
        "Failed to update user locale:",
        err.response?.data || err.message
      );
      if (err.response?.status === 400) {
        console.warn(
          "400 Bad Request: Locale update invalid or unnecessary. Using inherited locale."
        );
      } else if (err.response?.status === 403) {
        console.warn(
          "403 Forbidden: Admin role required. Using inherited locale."
        );
      } else if (err.response?.status === 404) {
        console.warn("404: Check buyer ID or user ID.");
      }
      // Proceed with inherited locale
    }
  } else {
    console.warn("User or CompanyID not available for locale update");
  }
}

// Assign locale via locale assignments (admin only, recommended for inheritance)
export async function assignLocaleToBuyer(
  localeId: string,
  buyerId: string = BUYER_ID
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No token available");

  try {
    await axios.post(
      `${baseUrl}/v1/locales/assignments`,
      {
        LocaleID: localeId,
        BuyerID: buyerId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Locale ${localeId} assigned to buyer ${buyerId}`);
  } catch (err: any) {
    console.error(
      "Failed to assign locale:",
      err.response?.data || err.message
    );
    throw new Error(
      "Locale assignment failed: Admin access or valid LocaleID required."
    );
  }
}

// Fetch available locales to determine valid IDs
export async function getLocales(): Promise<any> {
  const token = getToken();
  if (!token) throw new Error("No token available");

  try {
    const response = await axios.get(`${baseUrl}/v1/locales`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Available locales:", response.data.Items);
    return response.data.Items;
  } catch (err: any) {
    console.error("Failed to fetch locales:", err.response?.data);
    throw new Error("Failed to fetch locales: Check permissions.");
  }
}
// Add this function to auth.ts
export function logout(): void {
  localStorage.removeItem("access_token");
  console.log("User logged out – token removed");
  // Optional: clear any other stored data
  // localStorage.clear();
}
