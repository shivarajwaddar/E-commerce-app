import React, { useState } from "react";
import { Layout } from "../../components/layout/Layout.js";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/AuthStyles.css";
// Import icons from react-icons. Ensure you have installed react-icons (npm install react-icons)
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Unified password validation logic
  const validatePassword = (password) => {
    if (password.length < 7) {
      return "Password must be at least 7 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return; // Stop submission if password is invalid
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/v1/auth/register", {
        name,
        email,
        password,
        phone,
        address,
        answer,
        role: "admin", // Ensure the role is set to "admin" for this registration
      });

      setLoading(false);

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error(error); // Use console.error for errors
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Layout title="Register Admin - Ecommer App">
      {" "}
      {/* Updated title */}
      <div className="form-container" style={{ minHeight: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h5 className="title">ADMIN REGISTER FORM</h5> {/* Updated title */}
          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Enter Your Name"
              required
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Enter Your Email"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3 password-input-container">
            {" "}
            {/* Add class for styling */}
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Enter Your Password"
              required
              disabled={loading}
            />
            <span
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}{" "}
              {/* Render appropriate icon */}
            </span>
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-control"
              placeholder="Enter Your Phone"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-control"
              placeholder="Enter Your Address"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-control"
              placeholder="What's your favourite Sport Name"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Registering..." : "REGISTER"}
          </button>
          <div style={{ textAlign: "center", marginTop: "0.4rem" }}>
            Already registered?{" "}
            <Link to="/login" className="text-primary">
              Login
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AdminRegister;
