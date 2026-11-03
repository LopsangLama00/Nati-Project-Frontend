const CART_KEY = "cart";

export const getCartFromStorage = () => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCartToStorage = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};