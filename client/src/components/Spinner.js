import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Spinner = ({ path = "login" }) => {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/${path}`, {
            state: location.pathname,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // cleanup on unmount
  }, [navigate, location, path]);

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4>You are not LoggedIn</h4>
        <h4>Redirecting to Login Page in {count} seconds...</h4>
      </div>
    </>
  );
};

export default Spinner;
