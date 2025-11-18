// src/context/CartContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  qty: number;
}

interface CartContextType {
  orderID: string | null;
  setOrderID: (id: string | null) => void;
  items: CartItem[];
  addToCart: (productID: string, productName: string, qty?: number) => void;
  updateQuantity: (productID: string, newQty: number) => void;
  removeFromCart: (productID: string) => void;
  replaceCartItems: (items: CartItem[]) => void;   // ← NEW: this fixes everything
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [orderID, setOrderID] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (productID: string, productName: string, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === productID);
      if (existing) {
        return prev.map((i) => (i.id === productID ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { id: productID, name: productName, qty }];
    });
  };

  const updateQuantity = (productID: string, newQty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === productID ? { ...i, qty: newQty } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeFromCart = (productID: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productID));
  };

  // ← THIS IS THE KEY FUNCTION
  const replaceCartItems = (newItems: CartItem[]) => {
    setItems(newItems);
  };

  const clearCart = () => {
    setItems([]);
    setOrderID(null);
    localStorage.removeItem("oc_active_order_id");
  };

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        orderID,
        setOrderID,
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        replaceCartItems,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}