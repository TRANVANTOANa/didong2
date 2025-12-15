// context/CartContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

export type CartItem = {
  id: string;      // id sản phẩm
  name: string;
  price: number;   // giá dạng number
  image: any;
  size: string;    // ví dụ "40"
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  changeQty: (id: string, size: string, delta: 1 | -1) => void;
  removeItem: (id: string, size: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart: CartContextType["addToCart"] = (item) => {
    setItems((prev) => {
      // nếu cùng id + size đã tồn tại -> tăng qty
      const index = prev.findIndex(
        (p) => p.id === item.id && p.size === item.size
      );
      if (index !== -1) {
        const clone = [...prev];
        clone[index] = { ...clone[index], qty: clone[index].qty + 1 };
        return clone;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const changeQty: CartContextType["changeQty"] = (id, size, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id || item.size !== size) return item;
          const newQty = item.qty + delta;
          if (newQty <= 0) return { ...item, qty: 0 };
          return { ...item, qty: newQty };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem: CartContextType["removeItem"] = (id, size) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, changeQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
