import React from "react";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchInput = () => {
  const [values, setValues] = useSearch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(
        `/api/v1/product/search/${values.keyword}`
      );
      setValues({ ...values, results: data });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form
        className="d-flex search-form"
        role="search"
        onSubmit={handleSubmit}
        style={{ width: "35vw" }}
      >
        <input
          placeholder="Search for products, brands and more"
          className="form-control me-2"
          type="search"
          aria-label="Search"
          value={values.keyword}
          onChange={(e) => setValues({ ...values, keyword: e.target.value })}
        />
      </form>
    </div>
  );
};

export default SearchInput;
