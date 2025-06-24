import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth.js";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner.js";
import React from "react";

function AdminRoute() {
  const [ok, setOk] = useState();
  const [auth, setAuth] = useAuth();

  useEffect(() => {
    const authCheck = async () => {
      const res = await axios.get("/api/v1/auth/admin-auth", {
        // we are sending this token and The backend will check this token to validate whether the user is logged in and authorized.
        // instead of using heare we can use as globally in context api
        // headers: {
        //   Authorization: auth?.token,
        // },
      });

      if (res.data.ok) {
        setOk(true);
      } else {
        setOk(false);
      }
    };

    if (auth?.token) {
      authCheck();
    }
  }, [auth?.token]);

  return ok ? <Outlet /> : <Spinner path="" />;
}

export { AdminRoute };
