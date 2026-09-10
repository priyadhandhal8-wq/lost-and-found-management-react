import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportItem.css";
import API_URL from "../api";

function ReportFound() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    category: "",
    location: "",
    date: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image");
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const handleRemoveImage = () => {
    setImage(null);
    setPreview("");
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // FormData for image upload
      const data = new FormData();

      data.append("itemName", formData.itemName);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("type", "Found");

      if (image) {
        data.append("image", image);
      }

      const response = await fetch(
        `${API_URL}/api/items`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: data,
        }
      );

      const responseText = await response.text();

      let result = {};

      try {
        result = JSON.parse(responseText);
      } catch {
        result = {
          message: "Invalid response from server",
        };
      }

      if (response.ok) {
        setMessage(
          "Found item reported successfully!"
        );

        setFormData({
          itemName: "",
          description: "",
          category: "",
          location: "",
          date: "",
        });

        setImage(null);
        setPreview("");

        setTimeout(() => {
          navigate("/items");
        }, 1500);
      } else {
        setMessage(
          result.message ||
          "Unable to report found item"
        );
      }
    } catch (error) {
      console.error(
        "Report found error:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );
    }
  };

  return (
    <div className="report-page">

      <div className="report-card">

        <h1>Report Found Item</h1>

        <p className="report-subtitle">
          Enter the details of the item you found
        </p>

        <form onSubmit={handleSubmit}>

          <label>Item Name</label>

          <input
            type="text"
            name="itemName"
            placeholder="Example: Blue School Bag"
            value={formData.itemName}
            onChange={handleChange}
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            placeholder="Describe the item..."
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Category</label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Category
            </option>

            <option value="Electronics">
              Electronics
            </option>

            <option value="Documents">
              Documents
            </option>

            <option value="Wallet">
              Wallet
            </option>

            <option value="Bag">
              Bag
            </option>

            <option value="Jewellery">
              Jewellery
            </option>

            <option value="Clothing">
              Clothing
            </option>

            <option value="Other">
              Other
            </option>
          </select>

          <label>Location</label>

          <input
            type="text"
            name="location"
            placeholder="Where did you find it?"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <label>Date</label>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          {/* =========================
              IMAGE UPLOAD
          ========================== */}

          <label>Item Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* =========================
              IMAGE PREVIEW
          ========================== */}

          {preview && (
            <div className="image-preview">

              <img
                src={preview}
                alt="Item Preview"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>

            </div>
          )}

          <button type="submit">
            Report Found Item
          </button>

        </form>

        {message && (
          <p className="report-message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default ReportFound;