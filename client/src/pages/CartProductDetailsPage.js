import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cartContext";
import toast from "react-hot-toast";

import "../styles/ProductDetailsStyles.css"; // Ensure this path is correct

const CartProductDetailsPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();

  // New state to hold the specific cart item for this product
  const [productInCart, setProductInCart] = useState(null);

  // Effect to find the current product in the cart whenever product or cart changes
  useEffect(() => {
    if (product && cart?.length > 0) {
      const foundItem = cart.find((item) => item.product._id === product._id);
      setProductInCart(foundItem);
    } else {
      setProductInCart(null); // Reset if product isn't loaded or cart is empty
    }
  }, [product, cart]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!params?.slug) return;

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `/api/v1/product/get-product/${params.slug}`
        );
        if (data?.success) {
          setProduct(data.product);
          if (data.product?._id && data.product?.category?._id) {
            getSimilarProduct(data.product._id, data.product.category._id);
          } else {
            setRelatedProducts([]);
          }
        } else {
          setError(data?.message || "Failed to fetch product details.");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("There was an issue loading the product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [params?.slug]);

  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/related-product/${pid}/${cid}`
      );
      if (data?.success) {
        setRelatedProducts(data.products);
      } else {
        setRelatedProducts([]);
      }
    } catch (err) {
      console.error("Error fetching similar products:", err);
    }
  };

  const navigateToLogin = () => {
    navigate("/login", { state: { from: window.location.pathname } });
  };

  const handlePlaceOrderClick = async () => {
    // --- Stock check before placing order ---
    if (product.quantity <= 0) {
      // Using product.quantity for stock
      toast.error(`${product.name} is currently out of stock.`);
      return;
    }

    if (!auth?.token) {
      toast.error("Please log in to place an order.");
      navigateToLogin();
      return;
    }
    if (!auth?.user?.address) {
      toast.error("Please update your address before placing the order.");
      navigate("/dashboard/user/profile", {
        state: { from: window.location.pathname },
      });
      return;
    }
    if (!product) {
      toast.error("No product selected to place an order.");
      return;
    }

    // --- DETERMINE QUANTITY TO ORDER ---
    let orderQuantity = 1;
    let priceForOrder = product.price;

    if (productInCart) {
      // If product is in cart, use its cart quantity for order
      orderQuantity = productInCart.quantity;
      priceForOrder = productInCart.priceAtAddition || product.price; // Use price from cart if available

      // Additional check: Ensure cart quantity doesn't exceed available stock
      if (orderQuantity > product.quantity) {
        // Using product.quantity for stock
        toast.error(
          `You have ${orderQuantity} of "${product.name}" in your cart, but only ${product.quantity} are available. Please update your cart.`
        );
        return;
      }
    } else {
      // If product is not in cart, and they click "PLACE ORDER"
      // We default to 1, but should re-verify stock.
      if (product.quantity < 1) {
        // Using product.quantity for stock
        toast.error(`"${product.name}" is out of stock.`);
        return;
      }
      toast.error("This item is not in your cart. Ordering 1 unit.", {
        duration: 3000,
      });
    }

    const totalOrderAmount = orderQuantity * priceForOrder;

    // Optional: Add a confirmation for direct order
    if (
      !window.confirm(
        `Are you sure you want to place an order for ${orderQuantity} x "${
          product.name
        }" (Total: ₹${totalOrderAmount.toLocaleString("en-IN")})?`
      )
    ) {
      return;
    }

    try {
      setOrderLoading(true);

      const productForOrder = {
        product: product, // Send the full product object
        quantity: orderQuantity,
        priceAtAddition: priceForOrder,
      };

      // Send order details to backend
      const { data } = await axios.post(
        "/api/v1/orders/place-order",
        {
          cartItems: [productForOrder], // Send an array with just this product and its determined quantity
          totalAmount: totalOrderAmount, // Use the calculated total for the order
          paymentMethod: "cod",
        },
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data?.success) {
        toast.success(data.message || "Order Placed Successfully!");

        // --- Remove only the ordered item from the cart ---
        // This makes sense if they just ordered this specific quantity
        try {
          await axios.delete(
            `/api/v1/cart/remove-item/${product._id}`, // Call the endpoint to remove a specific item
            {
              headers: {
                Authorization: auth.token,
              },
            }
          );
          // Update frontend cart: filter out the removed item
          const updatedCart = cart.filter(
            (item) => item.product._id !== product._id
          );
          setCart(updatedCart);
          localStorage.setItem("cart", JSON.stringify(updatedCart));
          toast.success(
            `"${product.name}" (qty ${orderQuantity}) removed from your cart.`,
            {
              duration: 2000,
            }
          );
        } catch (removeCartItemError) {
          console.error(
            "Error removing item from cart after order:",
            removeCartItemError
          );
          toast.error(
            "Failed to automatically remove item from cart. Please refresh.",
            {
              duration: 5000,
            }
          );
        }
        // --- END cart item removal ---

        navigate("/dashboard/user/orders"); // Redirect to user's orders page
      } else {
        toast.error(data.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Something went wrong while placing your order.");
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setAuth(null);
        localStorage.removeItem("auth");
        navigateToLogin();
      }
    } finally {
      setOrderLoading(false);
    }
  };

  // Determine if the product is out of stock
  const isOutOfStock = product?.quantity !== undefined && product.quantity <= 0; // Using product.quantity

  if (loading) {
    return (
      <Layout>
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-message-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="no-product-found">
          <h2>Product Not Found</h2>
          <p>The product you are looking for does not exist.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={product.name}>
      <div className="product-details-page">
        <div className="product-main-section">
          <div className="product-image-gallery">
            <img
              src={
                product.photo ||
                "https://via.placeholder.com/400x400?text=No+Image"
              }
              alt={product.name}
              className="product-large-image"
            />
          </div>
          <div className="product-info-panel">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-category">
              Category: {product?.category?.name}
            </p>
            <div className="product-price">
              <span>Price:</span>
              <span className="price-value">
                {product?.price?.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </span>
            </div>
            <p className="product-description">{product.description}</p>

            {/* Display stock status using product.quantity */}
            {product.quantity !== undefined && (
              <p
                className={`fw-bold mb-2 ${
                  isOutOfStock ? "text-danger" : "text-success"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : `In Stock: ${product.quantity}`}
              </p>
            )}

            {/* Display quantity in cart if available */}
            {productInCart && productInCart.quantity > 0 && (
              <p className="fw-bold text-success mb-2">
                Quantity in Cart:{" "}
                <span className="badge bg-success fs-6">
                  {productInCart.quantity}
                </span>
              </p>
            )}
            {!productInCart && (
              <p className="fw-bold text-info mb-2">
                This item is not yet in your cart.
              </p>
            )}

            <button
              className="btn btn-secondary go-home-btn mt-2 mb-2 me-3"
              onClick={() => navigate("/cart")}
            >
              Go to Cart
            </button>

            <button
              className="btn btn-primary add-to-cart-btn"
              onClick={handlePlaceOrderClick}
              disabled={orderLoading || isOutOfStock} // Disable if out of stock
            >
              {orderLoading
                ? "Placing Order..."
                : isOutOfStock
                ? "OUT OF STOCK"
                : "PLACE ORDER"}
            </button>
          </div>
        </div>

        <hr className="section-divider" />

        <div className="similar-products-section">
          <h2 className="section-title">Similar Products</h2>
          {relatedProducts.length === 0 ? (
            <p className="text-center no-similar-products">
              No Similar Products found
            </p>
          ) : (
            <div className="row gx-3 gy-4">
              {relatedProducts.map((p) => (
                <div
                  key={p._id}
                  className="col-6 col-sm-4 col-md-2 col-lg-custom d-flex justify-content-center"
                >
                  <div
                    className="card shadow-sm"
                    style={{
                      width: "100%",
                      maxWidth: "230px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  >
                    <img
                      src={
                        p.photo ||
                        "https://via.placeholder.com/288x180?text=No+Image"
                      }
                      alt={p.name}
                      className="card-img-top"
                      style={{ height: "220px", objectFit: "cover" }}
                    />
                    <div className="card-body p-2 text-center">
                      <h6 className="card-title mb-1">{p.name}</h6>
                      <p className="card-text text-success mb-1 fw-semibold">
                        ₹{p.price.toLocaleString("en-IN")}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "#555",
                          height: "36px",
                          overflow: "hidden",
                        }}
                      >
                        {p.description.substring(0, 50)}...
                      </p>
                      {p.quantity !== undefined && (
                        <p
                          className={`fw-bold ${
                            p.quantity <= 0 ? "text-danger" : "text-success"
                          } mb-2`}
                        >
                          {p.quantity <= 0
                            ? "Out of Stock"
                            : `In Stock: ${p.quantity}`}
                        </p>
                      )}
                      <button
                        className="btn btn-sm btn-outline-secondary mb-2"
                        onClick={() => navigate(`/product/${p.slug}`)}
                      >
                        More Details
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          if (p.quantity <= 0) {
                            toast.error(`${p.name} is out of stock!`);
                            return;
                          }
                          const existingItem = cart.find(
                            (item) => item.product._id === p._id
                          );
                          if (existingItem) {
                            toast.error(`${p.name} already in cart!`);
                          } else {
                            const itemToAdd = {
                              product: p,
                              quantity: 1,
                              priceAtAddition: p.price,
                            };
                            setCart([...cart, itemToAdd]);
                            localStorage.setItem(
                              "cart",
                              JSON.stringify([...cart, itemToAdd])
                            );
                            toast.success(`${p.name} added to cart!`);
                          }
                        }}
                        disabled={p.quantity <= 0}
                      >
                        {p.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
  /* Custom responsive column layout */
  @media (max-width: 420px) {
    .col-lg-custom {
      flex: 0 0 50%;
      max-width: 50%;
    }
  }
  @media (min-width: 421px) and (max-width: 767px) {
    .col-lg-custom {
      flex: 0 0 33.33%;
      max-width: 33.33%;
    }
  }
  @media (min-width: 768px) and (max-width: 1024px) {
    .col-lg-custom {
      flex: 0 0 20%;
      max-width: 20%;
    }
  }
  @media (min-width: 1025px) {
    .col-lg-custom {
      flex: 0 0 16.66%;
      max-width: 16.66%;
    }
  }
`}</style>
      </div>
    </Layout>
  );
};

export default CartProductDetailsPage;
