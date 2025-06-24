import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  PackagePlus,
  ShoppingCart,
  Users,
  UserCog,
} from "lucide-react"; // Lucide icon set

const AdminMenu = () => {
  return (
    <div
      className="p-3"
      style={{
        position: "sticky",
        top: "80px",
        background: "#fff",
        minHeight: "100vh",
        borderRight: "1px solid #e0e0e0",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
      }}
    >
      <h5 className="text-muted mb-4">Admin Dashboard</h5>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/admin/create-category"
            className="nav-link d-flex align-items-center text-dark"
            activeClassName="active"
          >
            <Box className="me-2" size={18} />
            Create Category
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/admin/create-product"
            className="nav-link d-flex align-items-center text-dark"
            activeClassName="active"
          >
            <PackagePlus className="me-2" size={18} />
            Create Product
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/admin/products"
            className="nav-link d-flex align-items-center text-dark"
            activeClassName="active"
          >
            <Box className="me-2" size={18} />
            Products
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/admin/orders"
            className="nav-link d-flex align-items-center text-dark"
            activeClassName="active"
          >
            <ShoppingCart className="me-2" size={18} />
            Orders
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/admin/users"
            className="nav-link d-flex align-items-center text-dark"
            activeClassName="active"
          >
            <Users className="me-2" size={18} />
            Users
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/admin/profile"
            className="nav-link d-flex align-items-center text-dark"
            activeClassName="active"
          >
            <UserCog className="me-2" size={18} />
            Update profile
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminMenu;
