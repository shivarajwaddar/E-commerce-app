import React from "react";
import { Header } from "./Header.js";
import { Footer } from "./Footer.js";
import { Toaster } from "react-hot-toast";

export const Layout = (props) => {
  // props comming form App.js
  return (
    <>
      <Toaster />
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Header />
      </div>
      <main style={{ minHeight: "73vh" }}>{props.children}</main>
      <Footer />
    </>
  );
};
