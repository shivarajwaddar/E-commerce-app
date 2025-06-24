import React, { useState } from "react";
import { Layout } from "../../components/layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";
// Import icons from react-icons. Remember to install it if you haven't: npm install react-icons
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPasssword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [answer, setAnswer] = useState("");
  // New state for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // Renamed to avoid conflict if you had multiple passwords

  const navigate = useNavigate();

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

  // form function
  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      const res = await axios.post("/api/v1/auth/forgot-password", {
        email,
        newPassword,
        answer,
      });
      if (res && res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  // Function to toggle new password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  return (
    <Layout title={"Forgot Password - Ecommerce APP"}>
      <div className="form-container " style={{ height: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h5 className="title">RESET PASSWORD</h5>

          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              id="exampleInputEmail1"
              placeholder="Enter Your Email "
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-control"
              id="exampleInputEmail1"
              placeholder="Enter Your favorite Sport Name "
              required
            />
          </div>

          <div className="mb-3 password-input-container">
            {" "}
            {/* Added a container div for styling */}
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-control"
              id="exampleInputPassword1"
              placeholder="Enter Your New Password"
              required
            />
            <span
              className="password-toggle-icon"
              onClick={toggleNewPasswordVisibility}
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}{" "}
              {/* Render appropriate icon */}
            </span>
          </div>

          <button type="submit" className="btn btn-primary">
            RESET
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ForgotPasssword;
