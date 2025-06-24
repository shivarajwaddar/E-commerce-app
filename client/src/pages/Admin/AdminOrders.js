import React, { useState, useEffect, useMemo } from "react";
import { Layout } from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import { useAuth } from "../../context/auth";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [auth] = useAuth();
  console.log(
    "<<<<< CURRENT AUTH STATE IN ADMINORDERS (Top Level) >>>>>",
    auth
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState([]); // State to store order statuses from backend
  const [activeTab, setActiveTab] = useState("All Orders"); // New state for active tab

  // Combine "All Orders" with fetched statuses
  const orderStatusOptions = useMemo(() => {
    return ["All Orders", ...statuses];
  }, [statuses]);

  // Fetch orders AND all possible statuses
  useEffect(() => {
    console.log(
      "Checking useEffect conditions: token:",
      auth?.token ? "Yes" : "No",
      "role:",
      auth?.user?.role,
      "adminId:",
      auth?.user?.id
    );
    if (auth?.token && auth?.user?.role === "admin" && auth?.user?.id) {
      console.log("useEffect conditions MET! Admin User ID:", auth.user.id);

      const fetchAdminData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch orders
          const ordersResponse = await axios.get("/api/v1/orders/all-orders", {
            headers: {
              Authorization: auth.token,
            },
          });
          if (ordersResponse.data?.success) {
            setOrders(ordersResponse.data.orders);
            console.log(
              "ALL FETCHED ORDERS (Raw):",
              ordersResponse.data.orders
            );
          } else {
            setError(ordersResponse.data?.message || "Failed to fetch orders.");
            toast.error(
              ordersResponse.data?.message || "Failed to fetch orders."
            );
          }

          // Fetch statuses from the backend (assuming you have this endpoint)
          const statusesResponse = await axios.get(
            "/api/v1/orders/order-statuses", // This endpoint should return the enum values
            {
              headers: {
                Authorization: auth.token,
              },
            }
          );
          if (statusesResponse.data?.success) {
            setStatuses(statusesResponse.data.statuses);
            console.log(
              "Fetched Order Statuses:",
              statusesResponse.data.statuses
            );
          } else {
            toast.error(
              statusesResponse.data?.message ||
                "Failed to fetch order statuses."
            );
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
          setError("Something went wrong while fetching data.");
          toast.error("Error fetching data. Please try again.");
          if (error.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchAdminData();
    } else if (auth?.token && auth?.user?.role !== "admin") {
      console.log("User is logged in but not an admin.");
    } else {
      console.log("No token or user data available, or not an admin.");
    }
  }, [auth?.token, auth?.user?.role, auth?.user?.id]);

  // Filter orders relevant to THIS ADMIN'S PRODUCTS
  const filteredOrdersByAdminProduct = useMemo(() => {
    console.log(
      "Filtering logic check: orders.length:",
      orders.length,
      "auth.user.id:",
      auth?.user?.id
    );
    if (!orders.length || !auth?.user?.id) {
      console.log(
        "Filtering skipped: No orders or Admin User ID not available yet."
      );
      return [];
    }

    console.log("Filtering orders with Admin User ID:", auth.user.id);

    return orders.filter((order) => {
      const hasAdminProduct = order.products.some((item) => {
        const isCreatedByThisAdmin =
          item.product &&
          item.product.createdBy &&
          typeof item.product.createdBy === "object" &&
          item.product.createdBy._id === auth.user.id;

        return isCreatedByThisAdmin;
      });
      return hasAdminProduct;
    });
  }, [orders, auth?.user?.id]);

  console.log(
    "FINAL FILTERED ORDERS (after useMemo by Admin Product):",
    filteredOrdersByAdminProduct
  );

  // Further filter orders based on the active tab status
  const ordersForCurrentTab = useMemo(() => {
    if (activeTab === "All Orders") {
      return filteredOrdersByAdminProduct;
    }
    return filteredOrdersByAdminProduct.filter(
      (order) => order.orderStatus === activeTab
    );
  }, [activeTab, filteredOrdersByAdminProduct]);

  // Handle Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(
        `/api/v1/orders/order-status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );
      if (data?.success) {
        toast.success("Order status updated successfully!");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );
      } else {
        toast.error(data?.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating status. Please try again.");
    }
  };

  // Helper component to render the table (to avoid repetition)
  const renderOrderTable = (ordersToDisplay) => (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Status</th>
            <th scope="col">Buyer</th>
            <th scope="col">Date</th>
            <th scope="col">Payment Method</th>
            <th scope="col">Total Items</th>
            <th scope="col">Products (Yours)</th>
          </tr>
        </thead>
        <tbody>
          {ordersToDisplay.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-3">
                No orders in this status.
              </td>
            </tr>
          ) : (
            ordersToDisplay.map((o, i) => (
              <tr key={o._id}>
                <td>{i + 1}</td>
                <td>
                  <select
                    className="form-select"
                    value={o.orderStatus}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    disabled={!statuses.length}
                  >
                    {!statuses.length && (
                      <option value="">Loading Statuses...</option>
                    )}
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{o.buyer.name}</td>
                <td>{moment(o.createdAt).format("YYYY-MM-DD HH:mm")}</td>
                <td>
                  {o.orderStatus === "Delivered" && o.payment.method === "cod"
                    ? "COD (Success)"
                    : o.orderStatus === "Cancelled" ||
                      o.orderStatus === "Refunded"
                    ? o.payment.method === "cod"
                      ? "COD (Cancelled)"
                      : "Online (Cancelled)"
                    : o.payment.method === "cod"
                    ? "Cash on Delivery"
                    : "Online"}
                </td>
                <td>
                  {o.products.reduce((acc, item) => acc + item.quantity, 0)}
                </td>
                <td>
                  <div className="d-flex flex-column">
                    {o.products
                      .filter(
                        (item) =>
                          item.product &&
                          item.product.createdBy &&
                          typeof item.product.createdBy === "object" &&
                          item.product.createdBy._id === auth.user.id
                      )
                      .map((item, idx) => (
                        <div
                          className="product-item-container d-flex align-items-center mb-2" // Added class for styling
                          key={item.product._id || idx} // Use product._id for key, fallback to idx
                        >
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="img-thumbnail me-2 order-product-img" // Added class for styling
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              transition:
                                "transform 0.3s ease-in-out, background-color 0.3s ease-in-out, border-color 0.3s ease-in-out",
                              border: "2px solid transparent",
                              padding: "2px",
                              borderRadius: "4px", // Slightly rounded corners for the image itself
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = "scale(1.1)";
                              e.currentTarget.style.backgroundColor = "#e0f7fa"; // Light cyan
                              e.currentTarget.style.borderColor = "#007bff";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.borderColor = "transparent";
                            }}
                          />
                          <div>
                            <h6 className="mb-0">
                              <strong>{item.name}</strong>{" "}
                              {/* Make product name bolder */}
                            </h6>
                            <small className="text-muted">
                              Qty: {item.quantity}
                            </small>
                            <small className="text-muted d-block">
                              Price: ₹
                              {item.priceAtAddition.toLocaleString("en-IN")}
                            </small>
                          </div>
                        </div>
                      ))}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout>
      {/* Inline style block for both image and tab effects */}
      <style>
        {`
          /* Product Image Styles */
          .order-product-img {
            transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;
            border: 2px solid transparent;
            padding: 2px;
            border-radius: 4px;
          }

          /* Note: onMouseOver/Out handlers on the img itself handle hover for images,
             so the :hover rule here is less critical but good as fallback. */
          .order-product-img:hover {
            transform: scale(1.1);
            background-color: #e0f7fa; /* Light cyan */
            border-color: #007bff;
          }

          /* Ensure parent container can handle overflow for zoom effect */
          .product-item-container {
            overflow: hidden;
            position: relative;
            border-radius: 5px;
          }

          /* Tab Styles */
          .nav-tabs .nav-item .nav-link {
            background-color: #f8f9fa; /* Default background for inactive tabs */
            color: #495057; /* Default text color for inactive tabs */
            border: 1px solid #dee2e6;
            border-bottom: none; /* Make active tab's bottom border align */
            font-weight: 500; /* Slightly bolder text for all tabs */
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
          }

          .nav-tabs .nav-item .nav-link:hover {
            background-color: #e9ecef; /* Lighter grey on hover for inactive tabs */
            color: #0056b3; /* Darker blue text on hover */
            border-color: #a7d9f7; /* Light blue border on hover */
          }

          .nav-tabs .nav-item .nav-link.active {
            background-color: #007bff; /* Primary blue for active tab */
            color: #fff; /* White text for active tab */
            border-color: #007bff;
            font-weight: bold; /* Make active tab text bolder */
          }

          .nav-tabs .nav-item .nav-link.active:hover {
            background-color: #0056b3; /* Slightly darker blue on hover for active tab */
            border-color: #0056b3;
          }
        `}
      </style>

      <div className="container-fluid py-4 dashboard-container">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h2 className="text-center mb-4">
              Orders Related to Your Products
            </h2>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading Orders...</span>
                </div>
                <p className="mt-2">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            ) : filteredOrdersByAdminProduct.length === 0 ? (
              <div className="text-center py-5">
                <p className="lead">No orders found for your products.</p>
                {orders.length > 0 && auth?.user?.id && (
                  <p className="text-muted">
                    You have {orders.length} total orders, but none match
                    products you created with ID: {auth.user.id}.
                    <br />
                    **Important:** Ensure the products in these orders were
                    genuinely created by this specific admin account.
                  </p>
                )}
                {!auth?.user?.id && !loading && (
                  <p className="text-danger">
                    Admin user ID not available. Please ensure you are logged in
                    as an admin.
                  </p>
                )}
              </div>
            ) : (
              // --- Tabs for Order Statuses ---
              <div>
                <ul
                  className="nav nav-tabs mb-4"
                  id="orderStatusTabs"
                  role="tablist"
                >
                  {orderStatusOptions.map((status) => (
                    <li className="nav-item" key={status}>
                      <button
                        className={`nav-link ${
                          activeTab === status ? "active" : ""
                        }`}
                        onClick={() => setActiveTab(status)}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === status}
                      >
                        {status} (
                        {status === "All Orders"
                          ? filteredOrdersByAdminProduct.length
                          : filteredOrdersByAdminProduct.filter(
                              (o) => o.orderStatus === status
                            ).length}
                        )
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content" id="orderStatusTabsContent">
                  {orderStatusOptions.map((status) => (
                    <div
                      className={`tab-pane fade ${
                        activeTab === status ? "show active" : ""
                      }`}
                      id={`status-${status.replace(/\s/g, "")}`} // Generate unique ID
                      role="tabpanel"
                      key={`pane-${status}`}
                    >
                      {renderOrderTable(
                        status === "All Orders"
                          ? filteredOrdersByAdminProduct
                          : filteredOrdersByAdminProduct.filter(
                              (o) => o.orderStatus === status
                            )
                      )}
                    </div>
                  ))}
                </div>
              </div>
              // --- End Tabs ---
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrders;
