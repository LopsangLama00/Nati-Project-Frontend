import { useContext } from "react";
import { CartContext } from "./cartContext";

const useCart = () => {
  return useContext(CartContext);
};

export default useCart;