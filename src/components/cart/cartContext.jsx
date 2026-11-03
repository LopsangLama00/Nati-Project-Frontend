import { createContext, useEffect, useState } from "react";
import {
  getCartFromStorage,
  saveCartToStorage,
} from "./cartStorage";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(getCartFromStorage());

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.product_id === product.id
      );

      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.title,
          price: product.price,
          quantity,
          image_url: product.image_url,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.product_id !== productId
      )
    );
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};