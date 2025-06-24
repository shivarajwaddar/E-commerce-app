import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  // CRITICAL FIX: Set Axios default header IMMEDIATELY based on current auth state.
  // This line runs on every render, ensuring axios.defaults.headers.common["Authorization"]
  // always reflects the most up-to-date token, whether from initial state,
  // rehydration, or a new login/logout.
  if (auth?.token) {
    axios.defaults.headers.common["Authorization"] = auth.token;
  } else {
    // Ensure header is removed if token is null/empty, especially on logout
    delete axios.defaults.headers.common["Authorization"];
  }

  // Load auth data from localStorage on first load
  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      try {
        const parseData = JSON.parse(data);
        // CRITICAL FIX: Ensure _id is always present.
        // If parseData.user has 'id', use it for '_id'. Otherwise, use existing '_id' or null.
        const userId = parseData.user?.id || parseData.user?._id || null; // Prioritize 'id'

        setAuth({
          user: parseData.user
            ? {
                ...parseData.user, // Spread all other user properties (e.g., name, email, role, etc.)
                _id: userId, // Explicitly set the _id property
                id: userId, // (Optional) Keep 'id' for consistency if other parts of your app use it
              }
            : null,
          token: parseData.token,
        });
        // The Axios header will automatically be updated by the logic at the top of AuthProvider
        // once setAuth triggers a re-render.
      } catch (error) {
        console.error("Failed to parse auth data from localStorage:", error);
        localStorage.removeItem("auth"); // Clear corrupted data
        setAuth({ user: null, token: "" }); // Reset auth state
      }
    }
  }, []); // Run only once on component mount

  // Axios interceptor for handling expired tokens (this part is already good)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("auth");
          setAuth({
            user: null,
            token: "",
          });
          window.location.href = "/login"; // Redirect to login page
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []); // Empty dependency array for interceptor setup/teardown

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
