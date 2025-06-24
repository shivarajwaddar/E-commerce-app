import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useSearch } from "../../context/search";
import { useAuth } from "../../context/auth"; // ✅ Added this
import "../../styles/CartProductDetailsPage.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [values] = useSearch(); // { keyword, results }
  const [auth] = useAuth(); // ✅ Get auth for token

  // ✅ Fetch products for admin based on keyword
  const fetchAdminProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/v1/product/admin-filter-products",
        { keyword: values.keyword },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data.success) {
        setProducts(data.products);
      } else {
        setProducts([]);
        toast.error("Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching admin products:", err);
      toast.error("Something went wrong");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.token, values.keyword]);

  useEffect(() => {
    fetchAdminProducts(); // ✅ Call correct function
  }, [fetchAdminProducts]);

  return (
    <Layout title="Dashboard - All Products">
      <div className="container-fluid py-4" style={{ minHeight: "75vh" }}>
        <div className="row">
          <div className="col-md-3 mb-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h2 className="mb-4 text-center">All Products</h2>

            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <div className="row g-3">
                {products.length > 0 ? (
                  products.map((p) => (
                    <div
                      key={p._id}
                      className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-custom d-flex justify-content-center"
                    >
                      <Link
                        to={`/dashboard/admin/update-product/${p.slug}`}
                        className="text-decoration-none"
                      >
                        <div
                          className="card shadow-sm"
                          style={{
                            width: "100%",
                            maxWidth: "200px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            transition: "transform 0.2s",
                          }}
                        >
                          <img
                            src={p.photo}
                            className="card-img-top"
                            alt={p.name}
                            style={{
                              height: "180px",
                              objectFit: "cover",
                              borderBottom: "1px solid #eee",
                            }}
                          />
                          <div className="card-body p-2">
                            <h6 className="card-title mb-0">{p.name}</h6>
                            <p
                              className="card-text"
                              style={{
                                fontSize: "0.85rem",
                                height: "40px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                marginBottom: "3px",
                              }}
                            >
                              {p.description}
                            </p>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                marginBottom: "4px",
                              }}
                            >
                              <strong>Price:</strong> ₹{p.price}
                            </p>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                marginBottom: "8px",
                              }}
                            >
                              <strong>Qty:</strong> {p.quantity}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center mt-4">
                    <h4>No Products Found</h4>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 420px) {
          .col-xl-custom {
            flex: 0 0 50%;
            max-width: 50%;
          }
        }
        @media (min-width: 421px) and (max-width: 768px) {
          .col-xl-custom {
            flex: 0 0 33.3333%;
            max-width: 33.3333%;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .col-xl-custom {
            flex: 0 0 25%;
            max-width: 25%;
          }
        }
        @media (min-width: 1025px) {
          .col-xl-custom {
            flex: 0 0 20%;
            max-width: 20%;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Products;
