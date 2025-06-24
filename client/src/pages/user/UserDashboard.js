import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import UserMenu from "../../components/layout/UserMenu";
import { useAuth } from "../../context/auth";
import { Link } from "react-router-dom"; // For "Go to Profile" or "View Orders" buttons

const Dashboard = () => {
  const [auth] = useAuth();
  // If you later decide to fetch more data specific to the dashboard (e.g., recent activities)
  // const [dashboardStats, setDashboardStats] = useState(null);
  // const [loadingStats, setLoadingStats] = useState(true);

  // Example of fetching additional data if needed
  // useEffect(() => {
  //   const fetchDashboardStats = async () => {
  //     try {
  //       setLoadingStats(true);
  //       // const { data } = await axios.get('/api/v1/user/dashboard-stats', { headers: { Authorization: auth?.token } });
  //       // setDashboardStats(data.stats);
  //     } catch (error) {
  //       console.error("Error fetching dashboard stats:", error);
  //     } finally {
  //       setLoadingStats(false);
  //     }
  //   };
  //   if (auth?.token) {
  //     fetchDashboardStats();
  //   }
  // }, [auth?.token]);

  return (
    <Layout title={"Dashboard - Welcome " + (auth?.user?.name || "User")}>
      <div className="container-fluid py-3 dashboard-page">
        {" "}
        {/* Added py-3 for consistent padding */}
        <div className="row">
          <div className="col-md-3 mb-4">
            {" "}
            {/* mb-4 for margin below the menu on smaller screens */}
            <UserMenu />
          </div>
          <div className="col-md-9">
            {/* User Details Card */}
            <div className="card shadow-sm mb-4">
              {" "}
              {/* Added shadow-sm for depth */}
              <div className="card-header bg-primary text-white py-3">
                {" "}
                {/* Bootstrap header styling */}
                <h5 className="mb-0">Welcome, {auth?.user?.name}!</h5>
              </div>
              <div className="card-body">
                <h4 className="card-title mb-3">Your Details</h4>
                <ul className="list-group list-group-flush">
                  {" "}
                  {/* Bootstrap list group */}
                  <li className="list-group-item">
                    <strong className="text-muted">Name:</strong>{" "}
                    {auth?.user?.name}
                  </li>
                  <li className="list-group-item">
                    <strong className="text-muted">Email:</strong>{" "}
                    {auth?.user?.email}
                  </li>
                  <li className="list-group-item">
                    <strong className="text-muted">Phone:</strong>{" "}
                    {auth?.user?.phone || "N/A"} {/* Add phone detail */}
                  </li>
                  <li className="list-group-item">
                    <strong className="text-muted">Address:</strong>{" "}
                    {auth?.user?.address || "N/A"} {/* Display address */}
                  </li>
                </ul>
              </div>
              <div className="card-footer bg-light border-top d-flex justify-content-end p-3">
                {" "}
                {/* Footer for action buttons */}
                <Link
                  to="/dashboard/user/profile"
                  className="btn btn-outline-primary me-2"
                >
                  {" "}
                  {/* Link to profile page */}
                  <i className="bi bi-person-circle me-1"></i> Edit Profile
                </Link>
                <Link
                  to="/dashboard/user/orders"
                  className="btn btn-outline-success"
                >
                  {" "}
                  {/* Link to orders page */}
                  <i className="bi bi-box-seam me-1"></i> View Orders
                </Link>
              </div>
            </div>

            {/* Optional: Add a section for recent orders or quick stats */}
            {/* You can uncomment and expand this section if you want to display more interactive data */}
            {/*
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0">Recent Activity</h5>
                </div>
                <div className="card-body">
                    {loadingStats ? (
                        <div className="text-center"><div className="spinner-border text-secondary"></div></div>
                    ) : dashboardStats ? (
                        <>
                            <p>Last Order: {moment(dashboardStats.lastOrderDate).format('MMMM Do, YYYY')}</p>
                            <p>Total Orders Placed: {dashboardStats.totalOrders}</p>
                            <p>Pending Orders: {dashboardStats.pendingOrders}</p>
                            <Link to="/dashboard/user/orders" className="btn btn-info btn-sm mt-3">View All Orders</Link>
                        </>
                    ) : (
                        <p className="text-muted">No recent activity to display.</p>
                    )}
                </div>
            </div>
            */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
