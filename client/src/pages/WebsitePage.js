import React from "react";
import { Layout } from "../components/layout/Layout";
import { Link } from "react-router-dom";
import "../styles/WebsitePage.css";

const products = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  image: `https://via.placeholder.com/200x200?text=Product+${index + 1}`,
}));

const WebsitePage = () => {
  return (
    <div className="eshop-home">
      <header className="eshop-header">
        <h1>E-Shop</h1>
        <p>Your one-stop shop for everything!</p>
      </header>

      <section className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={`Product ${product.id}`} />
            <Link to="/shop" className="shop-button">
              Shop Now
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
};

export default WebsitePage;
