import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get All Categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/categories");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error getting categories");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    setPhoto(file); // Save the file
    if (file) {
      setPreview(URL.createObjectURL(file)); // Create a preview URL
    } else {
      setPreview(null); // If no file selected, clear preview
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", selectedCategory);
      formData.append("quantity", quantity);
      formData.append("shipping", shipping === "Yes");
      formData.append("photo", photo); // Important for Formidable + Cloudinary

      const { data } = await axios.post(
        "/api/v1/product/create-product",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Required for Formidable
          },
        }
      );

      if (data?.success) {
        toast.success(`${data.product.name} is created`);
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in creating the product");
    }

    setLoading(false); // Stop loading
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  return (
    <Layout title={"Dashboard - Create Product"}>
      <div className="container-fluid py-4" style={{ minHeight: "75vh" }}>
        <div className="row">
          <div className="col-md-3 mb-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h2 className="mb-4">Create Product</h2>

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap", // ensures responsive wrapping
              }}
            >
              {/* Left side inputs */}
              <div style={{ marginBottom: 20 }} className="col-md-5">
                <input
                  type="text"
                  value={name}
                  placeholder="Write a name"
                  className="form-control mb-3"
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  type="text"
                  value={description}
                  placeholder="Write a description"
                  className="form-control mb-3"
                  onChange={(e) => setDescription(e.target.value)}
                />

                <input
                  type="number"
                  value={price}
                  placeholder="Enter a product price"
                  className="form-control mb-3"
                  onChange={(e) => setPrice(e.target.value)}
                />

                <input
                  type="number"
                  value={quantity}
                  placeholder="Enter a quantity"
                  className="form-control mb-3"
                  onChange={(e) => setQuantity(e.target.value)}
                />

                <select
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="form-control mb-3"
                >
                  <option value="">Select Shipping Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Right side inputs */}
              <div style={{ marginBottom: 20 }} className="col-md-5">
                <Select
                  id="category-select"
                  placeholder="Select a category"
                  onChange={(value) => setSelectedCategory(value)}
                  value={selectedCategory}
                  style={{ width: "100%", marginBottom: "16px" }}
                  allowClear
                >
                  {categories.map((cat) => (
                    <Option key={cat._id} value={cat._id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>

                <div className="mb-3">
                  <label
                    className="btn btn-outline-secondary"
                    style={{ width: "100%" }}
                  >
                    {photo ? photo.name : "Upload Photo"}
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      hidden
                    />
                  </label>

                  {preview && (
                    <div className="mt-3">
                      <img
                        src={preview}
                        alt="Selected"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "150px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Create button */}
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
