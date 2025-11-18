import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface CartContextType {
  orderID: string | null;
  setOrderID: (id: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Persist orderID across refresh
  const [orderID, setOrderIDState] = useState<string | null>(
    localStorage.getItem("order_id")
  );

  const setOrderID = (id: string | null) => {
    setOrderIDState(id);

    if (id) {
      localStorage.setItem("order_id", id);
    } else {
      localStorage.removeItem("order_id");
    }
  };

  return (
    <CartContext.Provider value={{ orderID, setOrderID }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}