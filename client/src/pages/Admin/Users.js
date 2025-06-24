// client/src/pages/Admin/Users.js - (No changes needed for the date display itself)
import React, { useState, useEffect, useMemo } from "react";
import { Layout } from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment"; // For date formatting

const Users = () => {
  const [auth] = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [relevantUsers, setRelevantUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrdersAndFilterUsers = async () => {
      if (!auth?.token || auth?.user?.role !== "admin" || !auth?.user?.id) {
        setLoading(false);
        setError(
          "You are not authorized to view this page or not logged in as an admin."
        );
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get("/api/v1/orders/all-orders", {
          headers: {
            Authorization: auth.token,
          },
        });
        if (data?.success) {
          setAllOrders(data.orders);
          console.log("All orders fetched for filtering:", data.orders);
        } else {
          setError(
            data?.message ||
              "Failed to fetch orders to determine relevant users."
          );
          toast.error(data?.message || "Failed to fetch orders.");
        }
      } catch (err) {
        console.error("Error fetching orders for Admin Users:", err);
        setError("Error fetching data. Please try again.");
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndFilterUsers();
  }, [auth?.token, auth?.user?.role, auth?.user?.id]);

  useMemo(() => {
    if (!allOrders.length || !auth?.user?.id) {
      setRelevantUsers([]);
      return;
    }

    const uniqueUserIds = new Set();
    const tempUsers = [];

    allOrders.forEach((order) => {
      const hasAdminProduct = order.products.some(
        (item) =>
          item.product &&
          item.product.createdBy &&
          typeof item.product.createdBy === "object" &&
          item.product.createdBy._id === auth.user.id
      );

      if (
        hasAdminProduct &&
        order.buyer &&
        order.buyer._id &&
        !uniqueUserIds.has(order.buyer._id)
      ) {
        uniqueUserIds.add(order.buyer._id);
        tempUsers.push(order.buyer);
      }
    });

    setRelevantUsers(tempUsers);
    console.log(
      "Filtered Relevant Users who bought admin products:",
      tempUsers
    );
  }, [allOrders, auth?.user?.id]);

  return (
    <Layout title={"Dashboard - Users Who Bought Your Products"}>
      <div className="container-fluid py-4 dashboard-container">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1 className="text-center mb-4">
              Users Who Ordered Your Products
            </h1>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading Users...</span>
                </div>
                <p className="mt-2">Loading users data...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            ) : relevantUsers.length === 0 ? (
              <div className="text-center py-5">
                <p className="lead">
                  No users have ordered products created by you yet.
                </p>
                {allOrders.length > 0 && (
                  <p className="text-muted">
                    We found {allOrders.length} total orders, but none contain
                    products you created (Admin ID: {auth?.user?.id}).
                    <br />
                    Ensure products are linked to your admin ID and relevant
                    orders exist.
                  </p>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relevantUsers.map((user, i) => (
                      <tr key={user._id}>
                        <td>{i + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || "N/A"}</td>
                        <td>
                          {user.address && user.address.street
                            ? `${user.address.street}, ${user.address.city}, ${user.address.state}, ${user.address.zipCode}, ${user.address.country}`
                            : "N/A"}
                        </td>
                        {/* THIS LINE IS ALREADY CORRECT, ASSUMING BACKEND POPULATION */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
