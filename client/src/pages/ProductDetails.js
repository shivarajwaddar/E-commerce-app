import React, { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cartContext";
import toast from "react-hot-toast";

import "../styles/ProductDetailsStyles.css";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [auth] = useAuth();
  const [cart, setCart] = useCart();

  const isAdmin = auth?.user?.role === "admin";

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

  const handleAddToCart = (p) => {
    if (!auth?.user) {
      toast.error("Please log in to add items to your cart!");
      navigate("/login");
      return;
    }

    const existingItem = cart.find((item) => item._id === p._id);
    if (existingItem) {
      toast.error(`${p.name} is already in your cart!`);
    } else {
      setCart([...cart, p]);
      localStorage.setItem("cart", JSON.stringify([...cart, p]));
      toast.success(`${p.name} added to cart!`);
    }
  };

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
                {product?.price?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </div>
            <p className="product-description">{product.description}</p>
            <button
              className="btn btn-secondary go-home-btn mt-2 mb-2 me-3"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
            {!isAdmin && (
              <button
                className="btn btn-primary add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                ADD TO CART
              </button>
            )}
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
            <div className="similar-products-grid">
              {relatedProducts.map((p) => (
                <div className="product-card" key={p._id}>
                  <img
                    src={
                      p.photo ||
                      "https://via.placeholder.com/288x180?text=No+Image"
                    }
                    alt={p.name}
                    className="product-card-image"
                  />
                  <div className="product-card-body">
                    <h5 className="product-card-title">{p.name}</h5>
                    <p className="product-card-price">
                      {p.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </p>
                    <p className="product-card-description">
                      {p.description.substring(0, 60)}...
                    </p>
                    <div className="product-card-actions">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(`/product/${p.slug}`)}
                      >
                        More Details
                      </button>
                      {!isAdmin && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAddToCart(p)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .similar-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        @media (min-width: 478px) and (max-width: 767px) {
          .similar-products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 477px) {
          .similar-products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </Layout>
  );
};

export default ProductDetails;
