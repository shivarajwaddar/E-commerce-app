import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import UserMenu from "../../components/layout/UserMenu";
import { Layout } from "../../components/layout/Layout";
import { useAuth } from "../../context/auth";
import axios from "axios";
import moment from "moment";

import { Link } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All Orders");

  // Define the order statuses for the tabs - memoized for stability
  const orderStatuses = useMemo(
    () => [
      "All Orders",
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Refunded",
    ],
    []
  ); // Empty dependency array means this array is created only once

  const getOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("/api/v1/orders/user-orders", {
        headers: {
          Authorization: auth?.token,
        },
      });
      if (data?.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || "Failed to fetch orders.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response && error.response.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Could not fetch your orders. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getOrders();
    } else {
      setOrders([]);
      setLoading(false);
      setError("Please log in to view your orders.");
    }
  }, [auth?.token]);

  // Calculate counts for each status
  // This memoized value will re-calculate only when 'orders' data changes.
  const statusCounts = useMemo(() => {
    const counts = { "All Orders": orders.length };
    orderStatuses.forEach((status) => {
      if (status !== "All Orders") {
        counts[status] = orders.filter(
          (order) => order.orderStatus === status
        ).length;
      }
    });
    return counts;
  }, [orders, orderStatuses]); // Recalculate when orders or the orderStatuses list changes

  // Filter orders based on the active tab
  const filteredOrders =
    activeTab === "All Orders"
      ? orders
      : orders.filter((order) => order.orderStatus === activeTab);

  return (
    <Layout title={"Your Orders"}>
      <div className="container-fluid py-3 dashboard">
        <div className="row">
          <div className="col-md-3 mb-4">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center mb-4">Your Orders</h1>

            {/* Tabs for Order Status with counts */}
            <ul
              className="nav nav-tabs mb-4"
              id="orderStatusTabs"
              role="tablist"
            >
              {orderStatuses.map((status) => (
                <li className="nav-item" role="presentation" key={status}>
                  <button
                    className={`nav-link ${
                      activeTab === status ? "active" : ""
                    }`}
                    id={`${status.replace(/\s/g, "")}-tab`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === status}
                    onClick={() => setActiveTab(status)}
                  >
                    {status} {/* Display count */}
                    {statusCounts[status] !== undefined && (
                      <span className="badge bg-secondary ms-1">
                        {statusCounts[status]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading Orders...</span>
                </div>
                <p className="mt-3">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center m-4" role="alert">
                {error}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center p-5 border rounded shadow-sm bg-light m-4">
                <p className="lead fs-4">
                  {activeTab === "All Orders"
                    ? "You haven't placed any orders yet."
                    : `No orders found with status "${activeTab}".`}
                </p>
                {activeTab === "All Orders" && (
                  <Link to="/" className="btn btn-primary btn-lg mt-4">
                    Start Shopping
                  </Link>
                )}
              </div>
            ) : (
              <div className="order-list">
                {filteredOrders.map((o, i) => (
                  <div className="card mb-4 shadow-sm" key={o._id}>
                    <div className="card-header bg-primary text-white py-3">
                      <h5 className="mb-0">
                        Order # {i + 1} -{" "}
                        <span className="fw-normal">
                          {moment(o?.createdAt).format("MMMM Do, YYYY")}
                        </span>
                      </h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th scope="col">Status</th>
                              <th scope="col">Buyer</th>
                              <th scope="col">Time</th>
                              <th scope="col">Payment</th>
                              <th scope="col">Quantity</th>
                              <th scope="col">Total Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <span
                                  className={`badge ${
                                    o?.orderStatus === "Delivered"
                                      ? "bg-success"
                                      : o?.orderStatus === "Cancelled" ||
                                        o?.orderStatus === "Refunded"
                                      ? "bg-danger"
                                      : "bg-warning text-dark"
                                  }`}
                                >
                                  {o?.orderStatus}
                                </span>
                              </td>
                              <td>{o?.buyer?.name || auth?.user?.name}</td>
                              <td>{moment(o?.createdAt).format("h:mm A")}</td>
                              <td>
                                {o.orderStatus === "Delivered" &&
                                o.payment.method === "cod" ? (
                                  "COD (Success)"
                                ) : o.orderStatus === "Cancelled" ||
                                  o.orderStatus === "Refunded" ? (
                                  "Cancelled"
                                ) : (
                                  <>
                                    {o?.payment?.method === "cod"
                                      ? "Cash on Delivery"
                                      : "Online"}{" "}
                                    (
                                    <span
                                      className={`badge ${
                                        o?.payment?.status === "paid"
                                          ? "bg-success"
                                          : "bg-info text-dark"
                                      }`}
                                    >
                                      {o?.payment?.status}
                                    </span>
                                    )
                                  </>
                                )}
                              </td>
                              <td>
                                {o?.products?.reduce(
                                  (acc, item) => acc + item.quantity,
                                  0
                                )}
                              </td>
                              <td>
                                {o?.totalAmount.toLocaleString("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                })}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top p-3">
                      <h6 className="mb-3 text-primary">Ordered Items:</h6>
                      {o?.products?.map((p) => (
                        <div
                          className="row g-0 mb-3 align-items-center product-item-row"
                          key={p._id}
                        >
                          <div className="col-2 col-md-2 text-center pe-2">
                            <img
                              src={
                                p.photo ||
                                "https://via.placeholder.com/100x80?text=No+Image"
                              }
                              alt={p.name}
                              className="img-fluid rounded border"
                              style={{
                                maxHeight: "80px",
                                maxWidth: "100px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <div className="col-6 col-md-7">
                            <h6 className="mb-1">{p.name}</h6>
                            <p className="text-muted mb-0 small">
                              Quantity: {p.quantity}
                            </p>
                            <p className="text-muted mb-0 small">
                              Price at order:{" "}
                              {p.priceAtAddition.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              })}
                            </p>
                          </div>
                          <div className="col-4 col-md-3 text-end">
                            <p className="mb-0 fw-bold fs-5">
                              {(p.quantity * p.priceAtAddition).toLocaleString(
                                "en-IN",
                                {
                                  style: "currency",
                                  currency: "INR",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
