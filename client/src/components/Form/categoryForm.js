import React from "react";

const CategoryForm = ({ handleSubmit, value, setValue }) => {
  // props imported in createCategory.js

  return (
    <>
      <form onSubmit={handleSubmit} className="d-flex align-items-center gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Enter category"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </>
  );
};

export default CategoryForm;
