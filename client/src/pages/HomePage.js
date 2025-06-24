import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../components/layout/Layout";
import axios from "axios";
import { Checkbox, Radio, Skeleton, notification } from "antd";
import { Prices } from "../components/prices";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../context/search";
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/auth";
import "../styles/HomePage.css";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [addingToCartProductId, setAddingToCartProductId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(15); // for Load More

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navigate = useNavigate();
  const [values, setValues] = useSearch();
  const [cart, setCart] = useCart();
  const [auth] = useAuth();

  const isAdmin = auth?.user?.role === "admin";

  const getAllCategory = async () => {
    try {
      setCategoryLoading(true);
      const { data } = await axios.get("/api/v1/category/categories");
      if (data?.success) {
        setCategories(data.category);
      } else {
        notification.error({
          message: "Category Error",
          description: data?.message || "Failed to fetch categories.",
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      notification.error({
        message: "Category Fetch Failed",
        description: "Something went wrong fetching categories.",
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchProductsBasedOnFilters = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
        keyword: values.keyword,
      });
      setProducts(data?.success ? data.products : []);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      setProducts([]);
      notification.error({
        message: "Product Fetch Failed",
        description: "Something went wrong getting products.",
      });
    } finally {
      setLoading(false);
    }
  }, [checked, radio, values.keyword]);

  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
    setValues((prev) => ({ ...prev, results: [] }));
  };

  const handlePriceRadioChange = (e) => {
    setRadio(e.target.value);
    setValues((prev) => ({ ...prev, results: [] }));
  };

  const handleResetFilters = () => {
    setChecked([]);
    setRadio([]);
    setValues({ keyword: "", results: [] });
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  useEffect(() => {
    if (
      initialLoadComplete ||
      checked.length > 0 ||
      radio.length > 0 ||
      values.keyword
    ) {
      fetchProductsBasedOnFilters();
    } else if (!initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [
    checked,
    radio,
    values.keyword,
    fetchProductsBasedOnFilters,
    initialLoadComplete,
  ]);

  const displayTitle = () => {
    if (checked.length || radio.length) {
      return values.keyword
        ? `Filtered & Searched Products for "${values.keyword}"`
        : "Filtered Products";
    }
    return values.keyword
      ? `Search Results for "${values.keyword}"`
      : "All Products";
  };

  const handleAddToCartClick = async (product) => {
    if (!auth?.user) {
      toast.error("Please log in to add items to your cart!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (product.quantity <= 0) {
      toast.error(`${product.name} is currently out of stock.`);
      return;
    }

    setAddingToCartProductId(product._id);

    try {
      const res = await axios.post(
        "/api/v1/cart/add-item",
        { productId: product._id, quantity: 1 },
        {
          headers: { Authorization: auth.token },
        }
      );

      if (res.data?.success) {
        setCart(res.data.cart.items);
        toast.success(`${product.name} added to your cart!`);
      } else {
        toast.error(res.data?.message || "Failed to add to cart.");
      }
    } catch (err) {
      console.error("Error during add to cart:", err);
      if (err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/login", { state: "/cart" });
      } else {
        toast.error("Something went wrong while adding to cart.");
      }
    } finally {
      setAddingToCartProductId(null);
    }
  };

  const isProductInCart = (productId) => {
    return cart.some((item) => item.product && item.product._id === productId);
  };

  return (
    <Layout title={displayTitle()}>
      <div className="container-fluid homepage-container py-3">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 filter-sidebar pe-md-4">
            <div className="sticky-filter-wrapper">
              <h4 className="text-uppercase fw-bold mb-2">
                Filter By Category
              </h4>
              <div className="d-flex flex-column mb-2 category-filter-list">
                {categoryLoading ? (
                  <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                  categories.map((c) => (
                    <Checkbox
                      key={c._id}
                      onChange={(e) => handleFilter(e.target.checked, c._id)}
                      checked={checked.includes(c._id)}
                      className="mb-2"
                    >
                      {c.name}
                    </Checkbox>
                  ))
                )}
              </div>
              <hr className="my-4" />
              <h4 className="text-uppercase fw-bold mt-3 mb-3">
                Filter By Price
              </h4>
              <div className="d-flex flex-column mb-4 price-filter-list">
                <Radio.Group onChange={handlePriceRadioChange} value={radio}>
                  {Prices.map((p) => (
                    <div key={p._id} className="mb-2">
                      <Radio value={p.array}>{p.name}</Radio>
                    </div>
                  ))}
                </Radio.Group>
              </div>
              <hr className="my-4" />
              <button
                className="btn btn-primary w-75 py-2 fw-bold"
                onClick={handleResetFilters}
              >
                RESET FILTERS & SEARCH
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="col-12 col-md-9">
            <h3 className="text-center text-uppercase mb-4">
              {displayTitle()}
            </h3>
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-2">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid">
                  {products.slice(0, visibleCount).map((p) => (
                    <div key={p._id} className="card">
                      <div className="card h-100 shadow-sm w-100">
                        <img
                          src={
                            p.photo ||
                            "https://via.placeholder.com/288x180?text=No+Image"
                          }
                          className="card-img-top img-fluid"
                          alt={p.name}
                          style={{ height: "180px", objectFit: "cover" }}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5
                            className="card-title text-truncate"
                            title={p.name}
                          >
                            {p.name}
                          </h5>
                          <p className="card-text text-muted small">
                            {p.description.substring(0, 25)}
                            {p.description.length > 25 ? "..." : ""}
                          </p>
                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <span className="text-success fw-bold">
                              ₹{p.price}
                            </span>
                            {p.quantity > 0 ? (
                              <small className="text-muted">
                                Qty: {p.quantity}
                              </small>
                            ) : (
                              <small className="text-danger">
                                Out of Stock
                              </small>
                            )}
                          </div>
                          <button
                            className="btn btn-outline-info btn-sm mt-2"
                            onClick={() => navigate(`/product/${p.slug}`)}
                          >
                            More Details
                          </button>
                          {!isAdmin &&
                            (isProductInCart(p._id) ? (
                              <button
                                className="btn btn-success btn-sm mt-2"
                                onClick={() => navigate("/cart")}
                              >
                                Go to Cart
                              </button>
                            ) : (
                              <button
                                className="btn btn-warning btn-sm mt-2"
                                onClick={() => handleAddToCartClick(p)}
                                disabled={
                                  addingToCartProductId === p._id ||
                                  p.quantity <= 0
                                }
                              >
                                {addingToCartProductId === p._id
                                  ? "Adding..."
                                  : "Add to Cart"}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {visibleCount < products.length && (
                  <div className="text-center mt-4">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setVisibleCount(visibleCount + 15)}
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center mt-5">
                <h5 className="text-muted">No Products Found</h5>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
