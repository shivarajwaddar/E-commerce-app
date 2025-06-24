import React from "react";
import { Layout } from "../components/layout/Layout";

const Brand = () => {
  return (
    <Layout>
      <img
        src="/images/banner.png"
        alt="About Us"
        className="img-fluid rounded about-img"
        style={{
          height: "75vh",
          width: "100%", // Keeps the width responsive
          objectFit: "cover", // Keeps the image proportions intact
        }}
      />
    </Layout>
  );
};

export default Brand;
