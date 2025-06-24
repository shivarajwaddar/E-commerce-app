import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios"; // Make sure you have axios installed: npm install axios
import { useAuth } from "./auth"; // Adjust this path based on your file structure

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [auth] = useAuth(); // Access auth state to get the user's token

  // Helper function to fetch the user's cart from the backend
  const fetchUserCartFromBackend = useCallback(async () => {
    // If no auth token, clear the cart and local storage and exit
    if (!auth?.token) {
      setCart([]);
      localStorage.removeItem("cart"); // Ensure local storage is also cleared for guest users
      return;
    }

    try {
      // Make sure your backend endpoint is correct and handles authentication
      const { data } = await axios.get("/api/v1/cart/get", {
        headers: {
          Authorization: auth.token, // Send the authorization token
        },
      });

      if (data?.success) {
        setCart(data.cart.items); // Update cart state with backend data
        // Also immediately update local storage with the fetched cart
        localStorage.setItem("cart", JSON.stringify(data.cart.items));
      } else {
        // If backend returns no items or indicates a failure, clear cart
        setCart([]);
        localStorage.setItem("cart", JSON.stringify([]));
        console.warn(
          "Backend reported no cart items or failed to retrieve cart."
        );
      }
    } catch (error) {
      console.error("Error fetching cart from backend:", error);
      // Fallback: If fetching from backend fails, try to use what's in local storage
      // This prevents a blank cart if the network momentarily fails.
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        try {
          setCart(JSON.parse(localCart));
        } catch (parseError) {
          console.error(
            "Error parsing localStorage cart after backend fetch failure:",
            parseError
          );
          localStorage.removeItem("cart"); // Clear corrupted data
          setCart([]);
        }
      } else {
        setCart([]); // If no local data either, ensure cart is empty
      }
    }
  }, [auth?.token]); // Dependency: Re-run this function if the auth token changes (login/logout)

  // EFFECT 1: Initial load from localStorage and Backend Synchronization
  // This runs once when the component mounts and again if auth.token changes
  useEffect(() => {
    // 1. Attempt to load from localStorage first for quicker display
    const existingCartItem = localStorage.getItem("cart");
    if (existingCartItem) {
      try {
        setCart(JSON.parse(existingCartItem));
      } catch (parseError) {
        console.error(
          "Error parsing cart from localStorage on initial load:",
          parseError
        );
        localStorage.removeItem("cart"); // Clear corrupted data
        setCart([]); // Set to empty to avoid using invalid data
      }
    } else {
      setCart([]); // Ensure cart is empty if nothing in local storage
    }

    // 2. Then, if authenticated, fetch the most current cart from the backend
    // This will overwrite the localStorage data if the backend has a more accurate version.
    if (auth?.token) {
      fetchUserCartFromBackend();
    }
  }, [auth?.token, fetchUserCartFromBackend]); // Dependencies: Re-run if auth token changes or fetchUserCartFromBackend callback changes

  // EFFECT 2: Persist cart to localStorage whenever the cart state changes
  // This is CRUCIAL for immediate client-side persistence and triggering UI updates.
  useEffect(() => {
    // Only update localStorage if the current cart state is different
    // from what's already stored, to prevent unnecessary writes.
    // JSON.stringify is used for a simple deep comparison of array content.
    const currentCartJson = JSON.stringify(cart);
    if (currentCartJson !== localStorage.getItem("cart")) {
      localStorage.setItem("cart", currentCartJson);
      // Optional: console.log for debugging updates
      // console.log("Cart updated and saved to localStorage:", cart);
    }
  }, [cart]); // Dependency array: This effect runs every time the 'cart' state array reference changes

  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to consume the cart context
// This is what components like HomePage will use: const [cart, setCart] = useCart();
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };
