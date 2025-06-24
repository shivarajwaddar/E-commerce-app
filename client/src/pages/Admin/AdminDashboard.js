import React, { useState, useEffect, useMemo } from "react";
import AdminMenu from "../../components/layout/AdminMenu";
import { Layout } from "../../components/layout/Layout";
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [auth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Orders ---
  useEffect(() => {
    if (auth?.token && auth?.user?.role === "admin" && auth?.user?.id) {
      const fetchAdminOrders = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await axios.get("/api/v1/orders/all-orders", {
            headers: {
              Authorization: auth.token,
            },
          });
          if (data?.success) {
            setOrders(data.orders);
          } else {
            setError(data?.message || "Failed to fetch orders.");
            toast.error(data?.message || "Failed to fetch orders.");
          }
        } catch (err) {
          console.error("Error fetching admin orders:", err);
          setError("Failed to load order data.");
          toast.error("Error fetching order data.");
          if (err.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchAdminOrders();
    }
  }, [auth?.token, auth?.user?.role, auth?.user?.id]);

  // --- Process Orders to Count ---
  const { orderStatusCounts, totalProducts } = useMemo(() => {
    const counts = {};
    let productsCount = 0;

    if (orders.length && auth?.user?.id) {
      const adminRelevantOrders = orders.filter((order) =>
        order.products.some(
          (item) =>
            item.product &&
            item.product.createdBy &&
            typeof item.product.createdBy === "object" &&
            item.product.createdBy._id === auth.user.id
        )
      );

      adminRelevantOrders.forEach((order) => {
        order.products.forEach((item) => {
          if (
            item.product &&
            item.product.createdBy &&
            item.product.createdBy._id === auth.user.id
          ) {
            productsCount += item.quantity;
          }
        });

        counts[order.orderStatus] = (counts[order.orderStatus] || 0) + 1;
      });
    }

    return { orderStatusCounts: counts, totalProducts: productsCount };
  }, [orders, auth?.user?.id]);

  const statusColors = {
    "Not Processed": { bg: "bg-danger", icon: "fas fa-hourglass-start" },
    Processing: { bg: "bg-warning", icon: "fas fa-sync-alt" },
    Shipped: { bg: "bg-info", icon: "fas fa-shipping-fast" },
    Delivered: { bg: "bg-success", icon: "fas fa-check-circle" },
    Cancelled: { bg: "bg-secondary", icon: "fas fa-times-circle" },
    Refunded: { bg: "bg-dark", icon: "fas fa-undo-alt" },
  };

  return (
    <Layout>
      <div className="container-fluid py-4 dashboard-container">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>

          <div className="col-md-9">
            {/* Admin Info */}
            <div className="card bg-white shadow-sm p-4 mb-4 border-0 rounded-lg admin-info-card">
              <h4 className="mb-3 text-primary fw-bold">Admin Profile</h4>
              <div className="row g-2">
                <div className="col-12">
                  <p className="lead mb-1">
                    <i className="fas fa-user-circle me-2 text-secondary"></i>
                    <span className="fw-semibold">Name:</span>{" "}
                    {auth?.user?.name}
                  </p>
                </div>
                <div className="col-12">
                  <p className="lead mb-1">
                    <i className="fas fa-envelope me-2 text-secondary"></i>
                    <span className="fw-semibold">Email:</span>{" "}
                    {auth?.user?.email}
                  </p>
                </div>
                <div className="col-12">
                  <p className="lead mb-0">
                    <i className="fas fa-phone-alt me-2 text-secondary"></i>
                    <span className="fw-semibold">Contact:</span>{" "}
                    {auth?.user?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Stats */}
            <h4 className="mb-3 text-dark fw-bold">Overview</h4>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading data...</span>
                </div>
                <p className="mt-2">Loading dashboard data...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            ) : (
              <div className="row g-3">
                {/* Total Products Card */}
                <div className="col-md-4 col-sm-6">
                  <div className="card bg-primary text-white text-center p-3 shadow-sm rounded-lg">
                    <i className="fas fa-cubes fa-2x mb-2"></i>
                    <h5 className="card-title mb-1">
                      Total Products Sold (Yours)
                    </h5>
                    <p className="card-text fs-4 fw-bold">{totalProducts}</p>
                  </div>
                </div>

                {/* Status Cards (Always Show All) */}
                {Object.entries(statusColors).map(([status, style]) => {
                  const count = orderStatusCounts[status] || 0;

                  return (
                    <div className="col-md-4 col-sm-6" key={status}>
                      <div
                        className={`card ${style.bg} text-white text-center p-3 shadow-sm rounded-lg`}
                      >
                        <i className={`${style.icon} fa-2x mb-2`}></i>
                        <h5 className="card-title mb-1">
                          {count === 0
                            ? `No ${status} Orders`
                            : `${count} ${status} Orders`}
                        </h5>
                        <p className="card-text fs-4 fw-bold">{count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Activity */}
            <h4 className="mt-5 mb-3 text-dark fw-bold">Recent Activity</h4>
            <div className="card bg-white shadow-sm p-3 border-0 rounded-lg">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  New Order received: #ORD1001{" "}
                  <span className="badge bg-primary rounded-pill">
                    Just now
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Product "Smartwatch X" updated by Admin{" "}
                  <span className="badge bg-secondary rounded-pill">
                    5 min ago
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  User "Jane Doe" registered{" "}
                  <span className="badge bg-info rounded-pill">1 hr ago</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
