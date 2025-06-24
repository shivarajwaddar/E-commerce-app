import React, { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cartContext";
import toast from "react-hot-toast";
import axios from "axios";
import SearchInput from "../Form/SearchInput";

// Import Bootstrap components
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav"; // You might need this for <Nav>
import Navbar from "react-bootstrap/Navbar"; // And this for <Navbar>

// No longer strictly needed for dropdown functionality itself if using react-bootstrap,
// but keep if you use other FontAwesome icons elsewhere.
import "@fortawesome/fontawesome-free/css/all.min.css";

export const Header = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const location = useLocation();

  const isAdmin = auth?.user?.role === "admin";

  // Show search only on homepage or admin products page
  const showSearchBar =
    location.pathname === "/" ||
    location.pathname === "/dashboard/admin/products";

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    toast.success("Logout Successful");
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (auth?.token && !isAdmin) {
        try {
          const { data } = await axios.get("/api/v1/cart/get", {
            headers: {
              Authorization: auth.token,
            },
          });
          if (data?.success) {
            setCart(data.cart.items);
          }
        } catch (err) {
          console.error("Failed to fetch cart", err);
        }
      } else {
        setCart([]);
      }
    };

    fetchCart();
  }, [auth?.token, isAdmin, setCart]);

  return (
    // Replace the raw <nav> with Navbar from react-bootstrap
    <Navbar expand="lg" bg="dark" variant="dark" className="py-2">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-white me-3" to="/">
          🛒 E-Commerce App
        </Link>

        {/* The Navbar.Toggle and Navbar.Collapse handle the responsive behavior */}
        <Navbar.Toggle aria-controls="navbarTogglerDemo01" />

        <Navbar.Collapse id="navbarTogglerDemo01">
          <div className="d-md-flex align-items-center w-100">
            {showSearchBar && (
              <div className="d-none d-md-flex justify-content-center flex-grow-1">
                <SearchInput />
              </div>
            )}

            {/* Replace the raw <ul> with Nav from react-bootstrap */}
            <Nav className="ms-auto mb-2 mb-lg-0">
              {!isAdmin && (
                <Nav.Item>
                  <NavLink
                    to="/seller-register"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    style={{ color: "yellow", fontStyle: "italic" }}
                  >
                    Become a Seller
                  </NavLink>
                </Nav.Item>
              )}

              <Nav.Item>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link active text-white"
                      : "nav-link text-white"
                  }
                >
                  Home
                </NavLink>
              </Nav.Item>

              {!auth.user ? (
                <>
                  <Nav.Item>
                    <NavLink
                      to="/register"
                      className={({ isActive }) =>
                        isActive
                          ? "nav-link active text-white"
                          : "nav-link text-white"
                      }
                    >
                      Register
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        isActive
                          ? "nav-link active text-white"
                          : "nav-link text-white"
                      }
                    >
                      Login
                    </NavLink>
                  </Nav.Item>
                </>
              ) : (
                // Use NavDropdown component here
                <NavDropdown
                  title={auth?.user?.name}
                  id="basic-nav-dropdown"
                  menuVariant="dark" // For dark dropdown menu
                >
                  <NavDropdown.Item
                    as={Link} // Use as={Link} to integrate with react-router-dom
                    to={`/dashboard/${
                      auth.user.role === "admin" ? "admin" : "user"
                    }`}
                    className={({ isActive }) =>
                      isActive ? "dropdown-item active" : "dropdown-item"
                    }
                  >
                    Dashboard
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link} // Use as={Link} for Logout as well
                    to="/login"
                    onClick={handleLogout}
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}

              {!isAdmin && (
                <Nav.Item className="position-relative">
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-1 ${
                        isActive ? "active text-white" : "text-white"
                      }`
                    }
                  >
                    <i className="fas fa-shopping-cart fa-lg"></i>
                    <span>Cart</span>
                    {auth?.user && (
                      <span className="badge rounded-pill bg-danger cart-badge">
                        {Array.isArray(cart) ? cart.length : 0}
                      </span>
                    )}
                  </NavLink>
                </Nav.Item>
              )}
            </Nav>
          </div>
        </Navbar.Collapse>
      </div>

      {showSearchBar && (
        <div className="d-md-none w-100 mt-2 px-2">
          <SearchInput />
        </div>
      )}
    </Navbar>
  );
};
