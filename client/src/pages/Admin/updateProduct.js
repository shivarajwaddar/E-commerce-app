import React, { useState, useEffect } from "react";
import { Layout } from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [categoaries, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(""); // Can be string or File
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState("");
  const [preview, setPreview] = useState(null);
  const [id, setId] = useState("");
  const [category, setCategory] = useState("");

  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`
      );
      console.log(data.product.photo);
      setName(data.product.name);
      setId(data.product._id);
      setDescription(data.product.description);
      setPrice(data.product.price);
      setPhoto(data.product.photo); // URL from Cloudinary
      setQuantity(data.product.quantity);
      setShipping(data.product.shipping);
      setCategory(data.product.category);
      setSelectedCategory(data.product.category._id || data.product.category);
    } catch (err) {
      console.log(err);
      toast.error("Error getting a product");
    }
  };

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
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", selectedCategory);
      formData.append("quantity", quantity);
      formData.append("shipping", shipping === "Yes");
      formData.append("photo", photo);

      const { data } = await axios.put(
        `/api/v1/product/update-product/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data?.success) {
        toast.success(`${data.product.name} updated successfully`);
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong in updating the product");
    }
  };

  const handleDelete = async () => {
    try {
      let answer = window.confirm("Are you want to delete this product");
      // if answer is no then we will rerturn or no execute
      if (!answer) {
        return;
      }

      const { data } = await axios.delete(`/api/v1/product/delete/${id}`);
      if (data?.success) {
        toast.success("Product deleted succesfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error("Something went wrong while deleteing the product");
      }
    } catch (err) {
      console.log(err);
      toast.error("Somethign went wrong while deleting the product");
    }
  };

  useEffect(() => {
    getSingleProduct();
    getAllCategory();
    //eslint-disable-next-line
  }, []);

  return (
    <Layout title={"Dashboard - Update Product"}>
      <div className="container-fluid py-4" style={{ minHeight: "75vh" }}>
        <div className="row">
          <div className="col-md-3 mb-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h2 className="mb-4">Update Product</h2>

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
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
                  onChange={(e) => setShipping(e.target.value)}
                  className="form-control mb-3"
                  value={shipping ? "Yes" : "No"}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }} className="col-md-5">
                <Select
                  id="category-select"
                  placeholder="Select a category"
                  onChange={(value) => setSelectedCategory(value)}
                  value={selectedCategory}
                  style={{ width: "100%", marginBottom: "16px" }}
                  allowClear
                >
                  {categoaries.map((cat) => (
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
                    {photo instanceof File ? photo.name : "Upload Photo"}
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      hidden
                    />
                  </label>

                  {(preview || (typeof photo === "string" && photo)) && (
                    <div className="mt-3">
                      <img
                        src={preview || photo}
                        alt="Product"
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

            <button className="btn btn-primary me-3" onClick={handleUpdate}>
              Update Product
            </button>
            <button
              className="btn btn-primary me-3 btn-danger"
              onClick={handleDelete}
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
