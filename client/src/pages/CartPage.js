import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const [itemActionLoading, setItemActionLoading] = useState({});
  const [clearCartLoading, setClearCartLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const navigate = useNavigate();

  const navigateToLogin = () => {
    navigate("/login", { state: { from: "/cart" } });
  };

  const handlePlaceOrder = async () => {
    // Check for any out-of-stock items before placing order
    const hasOutOfStockItem = cart.some(
      (item) => item.product && item.product.quantity <= 0 // Changed from product.stock
    );
    if (hasOutOfStockItem) {
      toast.error(
        "Some items in your cart are out of stock. Please remove them before placing your order."
      );
      return;
    }

    if (!auth?.token) {
      toast.error("Please log in to place an order.");
      navigateToLogin();
      return;
    }
    if (!auth?.user?.address) {
      toast.error("Please update your address before placing the order.");
      navigate("/dashboard/user/profile", { state: { from: "/cart" } });
      return;
    }
    if (cart.length === 0) {
      toast.error(
        "Your cart is empty. Please add items before placing an order."
      );
      return;
    }

    try {
      setLoading(true);

      // Recalculate total amount, ensuring only in-stock items are counted
      const totalAmount = cart?.reduce(
        (acc, item) =>
          acc +
          (item.product && item.product.quantity > 0 // Changed from product.stock
            ? item.quantity * item.priceAtAddition
            : 0),
        0
      );

      const { data } = await axios.post(
        "/api/v1/orders/place-order",
        {
          cartItems: cart, // The backend should validate stock again here too
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
        },
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data?.success) {
        setLoading(false);
        toast.success(data.message || "Order Placed Successfully!");

        try {
          await axios.delete(`/api/v1/cart/clear-all`, {
            headers: {
              Authorization: auth.token,
            },
          });
          setCart([]);
          localStorage.removeItem("cart");
          toast.success("Your cart has been emptied.");
        } catch (clearCartError) {
          console.error("Error clearing cart after order:", clearCartError);
          toast.error("Failed to automatically clear cart. Please refresh.", {
            duration: 5000,
          });
        }
        navigate("/dashboard/user/orders");
      } else {
        setLoading(false);
        toast.error(data.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      setLoading(false);
      toast.error("Something went wrong while placing your order.");
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setAuth(null);
        localStorage.removeItem("auth");
        navigateToLogin();
      }
    }
  };

  const fetchUserCart = async () => {
    try {
      const { data } = await axios.get("/api/v1/cart/get", {
        headers: {
          Authorization: auth.token,
        },
      });
      if (data?.success) {
        setCart(data.cart.items);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setAuth(null);
        localStorage.removeItem("auth");
        navigateToLogin();
      } else {
        toast.error("Failed to fetch cart items.");
      }
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchUserCart();
    } else {
      setCart([]);
      localStorage.removeItem("cart");
    }
  }, [auth?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPrice = () => {
    try {
      let total = 0;
      cart?.forEach((item) => {
        // ONLY include items that are IN STOCK in the total price
        if (
          item.product &&
          typeof item.priceAtAddition === "number" &&
          item.product.quantity > 0 // Changed from product.stock
        ) {
          total += item.quantity * item.priceAtAddition;
        }
      });
      return total.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      });
    } catch (error) {
      console.error("Error calculating total price:", error);
      return "N/A";
    }
  };

  const checkAuthAndNavigate = () => {
    if (!auth?.token) {
      toast.error("Please log in to manage your cart.");
      navigateToLogin();
      return false;
    }
    return true;
  };

  const removeCartItem = async (productId) => {
    if (!checkAuthAndNavigate()) return;

    try {
      setItemActionLoading((prev) => ({ ...prev, [productId]: "removing" }));
      const { data } = await axios.delete(
        `/api/v1/cart/remove-item/${productId}`,
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data?.success) {
        toast.success("Item removed from cart.");
        setCart(data.cart.items);
        localStorage.setItem("cart", JSON.stringify(data.cart.items));
      } else {
        toast.error(data.message || "Failed to remove item from cart.");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("Something went wrong while removing item.");
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setAuth(null);
        localStorage.removeItem("auth");
        navigateToLogin();
      }
    } finally {
      setItemActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  const updateCartItemQuantity = async (productId, type) => {
    if (!checkAuthAndNavigate()) return;

    const currentItem = cart.find((item) => item.product._id === productId);
    if (!currentItem || !currentItem.product) {
      toast.error("Item not found in cart or product details missing.");
      return;
    }

    const availableStock = currentItem.product.quantity; // Changed from product.stock

    // Prevent any quantity updates if the product is genuinely out of stock
    if (availableStock !== undefined && availableStock <= 0) {
      toast.error(`"${currentItem.product.name}" is currently out of stock.`);
      return;
    }

    let newQuantity = currentItem.quantity;

    if (type === "increase") {
      newQuantity += 1;
      // Client-side check against actual available stock
      if (availableStock !== undefined && newQuantity > availableStock) {
        toast.error(
          `Only ${availableStock} of "${currentItem.product.name}" available in stock.`
        );
        return; // Prevent sending request if client-side check fails
      }
    } else if (type === "decrease") {
      newQuantity -= 1;
    } else {
      console.error("Invalid quantity update type:", type);
      return;
    }

    if (newQuantity < 1) {
      removeCartItem(productId);
      return;
    }

    try {
      setItemActionLoading((prev) => ({ ...prev, [productId]: "updating" }));

      const { data } = await axios.put(
        `/api/v1/cart/update-quantity/${productId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data?.success) {
        toast.success("Cart quantity updated.");
        setCart(data.cart.items);
        localStorage.setItem("cart", JSON.stringify(data.cart.items));
      } else {
        toast.error(data.message || "Failed to update quantity.");
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while updating quantity.");
      }
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setAuth(null);
        localStorage.removeItem("auth");
        navigateToLogin();
      }
    } finally {
      setItemActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  const handleClearAllCart = async () => {
    if (!checkAuthAndNavigate()) return;

    if (cart.length === 0) {
      toast("Your cart is already empty!", { icon: "ℹ️" });
      return;
    }

    if (!window.confirm("Are you sure you want to clear your entire cart?")) {
      return;
    }

    try {
      setClearCartLoading(true);
      const { data } = await axios.delete(`/api/v1/cart/clear-all`, {
        headers: {
          Authorization: auth.token,
        },
      });

      if (data?.success) {
        toast.success(data.message || "Cart emptied successfully!");
        setCart([]);
        localStorage.removeItem("cart");
      } else {
        toast.error(data.message || "Failed to clear cart.");
      }
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error("Something went wrong while clearing your cart.");
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setAuth(null);
        localStorage.removeItem("auth");
        navigateToLogin();
      }
    } finally {
      setClearCartLoading(false);
    }
  };

  const renderQuantitySpinner = (productId) => {
    return (
      itemActionLoading[productId] === "updating" && (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
      )
    );
  };

  // Determine if any item in the cart is out of stock (based on product.quantity)
  const hasOutOfStockItemInCart = cart.some(
    (item) => item.product && item.product.quantity <= 0 // Changed from product.stock
  );

  return (
    <Layout>
      <div className="cart-page">
        <div className="container">
          <div className="row cart-header-row">
            <div className="col-md-12 text-center py-3 bg-light rounded shadow-sm ">
              <h1 className="display-6 fw-bold mb-1">
                {!auth?.user
                  ? "Hello Guest!"
                  : `Welcome Back, ${auth?.user?.name}!`}
              </h1>
              <p className="lead mb-0 text-muted">
                {cart?.length
                  ? `You have ${cart.length} item${
                      cart.length > 1 ? "s" : ""
                    } in your cart.`
                  : "Your Cart Is Empty."}
                {!auth?.token && cart?.length > 0 && (
                  <span className="d-block mt-1 text-danger fw-semibold">
                    Please log in to proceed to checkout!
                  </span>
                )}
                {/* Display general out of stock message if any item is out of stock */}
                {hasOutOfStockItemInCart && (
                  <span className="d-block mt-1 text-danger fw-semibold">
                    Some items in your cart are currently out of stock. Please
                    review your cart.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-7 cart-items-list">
              {cart?.length === 0 && !auth?.user && (
                <div className="text-center my-5 p-4 bg-white rounded shadow-sm">
                  <p className="lead mb-3">
                    Looks like your cart is empty or you need to log in to see
                    your saved items.
                  </p>
                  <button
                    className="btn btn-primary btn-lg me-2"
                    onClick={() => navigateToLogin()}
                  >
                    Log In Now
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate("/register")}
                  >
                    New? Register Here
                  </button>
                </div>
              )}
              {cart?.map((item) => {
                const { product, quantity, priceAtAddition } = item;
                if (!product || !product._id) return null;

                const isUpdating =
                  itemActionLoading[product._id] === "updating";
                const isRemoving =
                  itemActionLoading[product._id] === "removing";

                // Check if the product is out of stock (quantity is 0 or less)
                const isOutOfStock =
                  product.quantity !== undefined && product.quantity <= 0; // Changed from product.stock

                // Determine if the "+" button should be disabled
                const isPlusDisabled =
                  isUpdating ||
                  isOutOfStock || // Disable if out of stock
                  (product.quantity !== undefined &&
                    quantity >= product.quantity); // Changed from product.stock

                // Determine if the "-" button should be disabled
                const isMinusDisabled =
                  isUpdating || isOutOfStock || quantity <= 1;

                return (
                  <div
                    className="card cart-item-card flex-row mb-3 shadow-sm rounded-lg"
                    key={product._id}
                  >
                    <div className="col-md-3 col-sm-4 cart-item-image-col p-0">
                      <img
                        onClick={() => navigate(`/cart-item/${product.slug}`)}
                        src={
                          product.photo ||
                          "https://via.placeholder.com/200x150?text=No+Image"
                        }
                        className="img-fluid cart-item-img"
                        alt={product.name}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    <div className="col-md-6 col-sm-5 cart-item-details py-3 pe-0">
                      <h5 className="cart-item-name mb-1">{product.name}</h5>
                      <p className="cart-item-description text-muted mb-2">
                        {product.description?.substring(0, 50)}
                        {product.description?.length > 50 ? "..." : ""}
                      </p>
                      <p className="cart-item-price fw-bold mb-1">
                        ₹
                        {priceAtAddition !== undefined
                          ? priceAtAddition.toLocaleString("en-IN")
                          : product.price?.toLocaleString("en-IN")}
                      </p>
                      {/* Display available stock or Out of Stock */}
                      {product.quantity !== undefined && ( // Changed from product.stock
                        <p
                          className={`cart-item-stock fw-semibold ${
                            isOutOfStock ? "text-danger" : "text-success"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : `Available: ${product.quantity}`}{" "}
                          {/* Changed from product.stock */}
                        </p>
                      )}
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={() =>
                            updateCartItemQuantity(product._id, "decrease")
                          }
                          disabled={isMinusDisabled}
                        >
                          {isUpdating
                            ? renderQuantitySpinner(product._id)
                            : isOutOfStock
                            ? "Remove" // Suggest removal for out of stock
                            : "-"}
                        </button>
                        <span className="fw-bold me-2">
                          {isOutOfStock ? 0 : quantity}
                        </span>{" "}
                        {/* Show 0 if out of stock */}
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            updateCartItemQuantity(product._id, "increase")
                          }
                          disabled={isPlusDisabled}
                        >
                          {isUpdating
                            ? renderQuantitySpinner(product._id)
                            : isOutOfStock
                            ? "Out of Stock"
                            : "+"}
                        </button>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-3 d-flex align-items-center justify-content-center p-2">
                      {auth?.token ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeCartItem(product._id)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Removing...
                            </>
                          ) : (
                            "Remove"
                          )}
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            toast.error("Please log in to manage your cart.");
                            navigateToLogin();
                          }}
                        >
                          Login to Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {cart?.length > 0 && (
                <div className="text-center mt-4 mb-4">
                  <button
                    className="btn btn-outline-danger btn-lg"
                    onClick={handleClearAllCart}
                    disabled={clearCartLoading || !auth?.token}
                  >
                    {clearCartLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Clearing Cart...
                      </>
                    ) : (
                      "Clear All Items from Cart"
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-5 cart-summary-panel py-4 px-4 bg-white rounded shadow-sm">
              <h2 className="text-center mb-3 fw-bold">Order Summary</h2>
              <p className="text-center text-muted border-bottom pb-3 mb-2">
                Total | Checkout | Payment
              </p>
              <h4 className="total-amount mb-3 text-primary text-center">
                Total: {totalPrice()}{" "}
              </h4>
              {auth?.user?.address ? (
                <div className="mb-3">
                  <h5 className="mb-2 fw-semibold">Delivery Address:</h5>
                  <p className="text-muted mb-2">{auth?.user?.address}</p>
                  <button
                    className="btn btn-outline-info btn-sm w-100"
                    onClick={() =>
                      navigate("/dashboard/user/profile", {
                        state: { from: "/cart" },
                      })
                    }
                  >
                    Update Address
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  {auth?.token ? (
                    <button
                      className="btn btn-warning w-100"
                      onClick={() =>
                        navigate("/dashboard/user/profile", {
                          state: { from: "/cart" },
                        })
                      }
                    >
                      Update Address for Checkout
                    </button>
                  ) : (
                    <button
                      className="btn btn-success w-100"
                      onClick={() => navigateToLogin()}
                    >
                      Login to Checkout
                    </button>
                  )}
                </div>
              )}
              <hr />
              <div className="mt-3 payment-section">
                <h5 className="mb-3 fw-semibold">Payment Options:</h5>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="cod">
                    Cash on Delivery (COD)
                  </label>
                </div>

                <button
                  className="btn btn-primary w-100 mt-3"
                  // Disable if no token, empty cart, no address, or if any item is out of stock
                  disabled={
                    loading ||
                    !auth?.token ||
                    !cart?.length ||
                    !auth?.user?.address ||
                    hasOutOfStockItemInCart // Disabled if any item is out of stock
                  }
                  onClick={handlePlaceOrder}
                >
                  {loading ? "Placing Order...." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
