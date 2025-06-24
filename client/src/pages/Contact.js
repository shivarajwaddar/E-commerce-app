import React from "react";
import { Layout } from "../components/layout/Layout";
import { BiMailSend, BiPhoneCall, BiSupport } from "react-icons/bi";

const Contact = () => {
  return (
    <Layout title={"Contact us"}>
      <div className="contact-page container-fluid">
        <div
          className="row align-items-center contact-section"
          style={{ minHeight: "73vh" }}
        >
          <div className="col-md-6 mb-4 mb-md-0 text-center">
            <img
              src="/images/contactus.jpeg"
              alt="Contact Us"
              className="img-fluid rounded contact-img"
            />
          </div>
          <div className="col-md-6 contact-content px-4">
            <h2 className="mb-3 text-center bg-dark text-white p-2">
              CONTACT US
            </h2>
            <p className="text-justify">
              Any query and info about products — feel free to call anytime,
              we’re available 24×7.
            </p>
            <p className="mt-3">
              <BiMailSend /> : www.help@ecommerceapp.com
            </p>
            <p className="mt-3">
              <BiPhoneCall /> : 012-3456789
            </p>
            <p className="mt-3">
              <BiSupport /> : 1800-0000-0000 (toll free)
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
