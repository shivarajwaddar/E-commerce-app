import React from "react";
import { Layout } from "../components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout title={"Privacy Policy - E-Commerce App"}>
      <div
        className="privacy-policy container-fluid"
        style={{ height: "75vh", overflowY: "auto" }}
      >
        <div
          className="row align-items-center justify-content-center"
          style={{ height: "100%" }}
        >
          <div className="col-md-8 px-4">
            <h2 className="mb-4 text-center text-primary">Privacy Policy</h2>
            <p style={{ fontSize: "17px" }}>
              We reserve the right to update or modify this Privacy Policy at
              any time. When we make changes, we will post the revised policy on
              this page and update the date at the top. We encourage you to
              review this policy periodically to stay informed about how we
              protect your data.
            </p>

            <p style={{ fontSize: "17px" }}>
              If you have any questions regarding this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:support@ecommerceapp.com"
                style={{ fontSize: "17px" }}
              >
                support@ecommerceapp.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
