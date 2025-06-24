import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.js";
import About from "./pages/About.js";
import Contact from "./pages/Contact.js";
import Privacy from "./pages/Privacy.js";
import PageNotFound from "./pages/PageNotFound.js";
import Brand from "./pages/Brand.js";
import Register from "./pages/Auth/Register.js";
import Login from "./pages/Auth/Login.js";
import AdminRegister from "./pages/Auth/AdminRegister.js";
import ForgotPasssword from "./pages/Auth/ForgotPassword.js";
import UserDashboard from "./pages/user/UserDashboard.js";
import { UserRoute } from "./components/Routes/UserRoute.js";
import { AdminRoute } from "./components/Routes/AdminRoute.js";
import "./index.css";
import AdminDashboard from "./pages/Admin/AdminDashboard.js";
import AdminProfile from "./pages/Admin/AdminProfile.js";
import CreateCategory from "./pages/Admin/CreateCategory.js";
import CreateProduct from "./pages/Admin/CreateProduct.js";
import Users from "./pages/Admin/Users.js";
import Orders from "./pages/user/Orders.js";
import Profile from "./pages/user/Profile.js";
import Products from "./pages/Admin/Products.js";
import ProductDetails from "./pages/ProductDetails.js";
import UpdateProduct from "./pages/Admin/updateProduct.js";
import CartPage from "./pages/CartPage.js";
import CartProductDetailsPage from "./pages/CartProductDetailsPage.js";
import AdminOrders from "./pages/Admin/AdminOrders.js";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/cart-item/:slug" element={<CartProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* <Route path="/checkout" element={<CheckoutPagee />} /> */}

        <Route path="/dashboard" element={<UserRoute />}>
          <Route path="user" element={<UserDashboard />} />
          <Route path="user/orders" element={<Orders />} />
          <Route path="user/profile" element={<Profile />} />
        </Route>
        <Route path="/dashboard" element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/create-category" element={<CreateCategory />} />
          <Route path="admin/create-product" element={<CreateProduct />} />
          <Route
            path="admin/update-product/:slug"
            element={<UpdateProduct />}
          />
          <Route path="admin/products" element={<Products />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/orders" element={<AdminOrders />} />
          <Route path="admin/profile" element={<AdminProfile />} />
        </Route>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policy" element={<Privacy />} />
        <Route path="/brand" element={<Brand />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller-register" element={<AdminRegister />} />
        <Route path="/forgot-password" element={<ForgotPasssword />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
