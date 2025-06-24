import React, { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import AdminMenu from "../../components/layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import CategoryForm from "../../components/Form/categoryForm";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/v1/category/create-category", {
        name,
      });
      if (data?.success) {
        toast.success(`${data.category.name} created`);
        getAllCategory();
        setName("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/admin-categories");
      if (data.success) setCategories(data.category);
    } catch (err) {
      console.log(err);
      toast.error("Error getting categories");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/v1/category/update-category/${selected._id}`,
        { name: updatedName }
      );
      if (data.success) {
        toast.success("Category updated");
        setShow(false);
        setSelected(null);
        setUpdatedName("");
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;
    try {
      const { data } = await axios.delete(
        `/api/v1/category/delete-category/${id}`
      );
      if (data.success) {
        toast.success("Category deleted");
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  return (
    <Layout title="Dashboard - Manage Categories">
      <div className="container-fluid py-4" style={{ minHeight: "75vh" }}>
        <div className="row">
          <div className="col-md-3 mb-3">
            <AdminMenu />
          </div>

          <div className="col-md-9">
            <div
              className="p-4 rounded shadow-sm"
              style={{ backgroundColor: "#fff" }}
            >
              <h3
                className="text-center mb-4 mt-0 fw-semibold"
                style={{ color: "#2874f0" }}
              >
                Manage Categories
              </h3>

              {/* Category Form */}
              <div className="d-flex justify-content-center mb-4">
                <div className="w-100" style={{ maxWidth: "500px" }}>
                  <CategoryForm
                    handleSubmit={handleSubmit}
                    value={name}
                    setValue={setName}
                  />
                </div>
              </div>

              {/* Category Table */}
              <div className="table-responsive">
                <table className="table table-bordered text-center align-middle">
                  <thead style={{ backgroundColor: "#2874f0", color: "#fff" }}>
                    <tr>
                      <th>Category Name</th>
                      <th style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories?.map((c) => (
                      <tr key={c._id}>
                        <td className="fw-medium">{c.name}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => {
                              setShow(true);
                              setUpdatedName(c.name);
                              setSelected(c);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(c._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-muted py-3">
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Edit Modal */}
              <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Update Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <form onSubmit={handleUpdate}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter new category name"
                      value={updatedName}
                      onChange={(e) => setUpdatedName(e.target.value)}
                      required
                    />
                    <div className="text-end mt-3">
                      <Button
                        variant="secondary"
                        className="me-2"
                        onClick={() => setShow(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCategory;
