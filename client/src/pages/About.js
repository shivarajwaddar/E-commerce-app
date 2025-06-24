import React from "react";
import { Layout } from "../components/layout/Layout.js";

const About = () => {
  return (
    <Layout title={"About us - Ecommerce App"}>
      <div className="about-page container-fluid">
        <div
          className="row align-items-center about-section"
          style={{ minHeight: "73vh" }}
        >
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src="/images/about.jpeg"
              alt="About Us"
              className="img-fluid rounded about-img"
            />
          </div>
          <div className="col-md-6 about-content px-4">
            <h2 className="mb-3">About Us</h2>
            <p className="text-justify">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus
              officiis obcaecati esse tempore unde ratione, eveniet mollitia,
              perferendis eius temporibus dicta blanditiis doloremque explicabo
              quasi sunt vero optio cum aperiam vel consectetur! Laborum enim
              accusantium atque, excepturi sapiente amet! Tenetur ducimus aut
              commodi illum quidem neque tempora nam.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
