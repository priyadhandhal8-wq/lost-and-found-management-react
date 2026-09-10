import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditItem.css";
import API_URL from "../api";

function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        itemName: "",
        description: "",
        category: "",
        location: "",
        date: "",
        type: "",
    });

    const [currentImage, setCurrentImage] = useState("");
    const [newImage, setNewImage] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    // ==========================================
    // GET ITEM DETAILS
    // ==========================================

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/items/${id}`
            );

            const data = await response.json();

            if (response.ok) {
                setFormData({
                    itemName: data.itemName || "",
                    description: data.description || "",
                    category: data.category || "",
                    location: data.location || "",
                    date: data.date
                        ? new Date(data.date)
                            .toISOString()
                            .split("T")[0]
                        : "",
                    type: data.type || "",
                });

                setCurrentImage(data.image || "");
                setRemoveImage(false);
                setNewImage(null);
            } else {
                setError(data.message || "Unable to load item");
            }
        } catch (error) {
            console.error(error);
            setError("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ==========================================
    // HANDLE NEW IMAGE
    // ==========================================

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setNewImage(file);

        // If new image selected, don't remove image
        setRemoveImage(false);
    };

    // ==========================================
    // REMOVE CURRENT IMAGE
    // ==========================================

    const handleRemoveImage = () => {
        setRemoveImage(true);
        setCurrentImage("");
        setNewImage(null);
    };

    // ==========================================
    // UPDATE ITEM
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");

        try {
            const data = new FormData();

            // Normal fields
            data.append("itemName", formData.itemName);
            data.append("description", formData.description);
            data.append("category", formData.category);
            data.append("location", formData.location);
            data.append("date", formData.date);
            data.append("type", formData.type);

            // New image
            if (newImage) {
                data.append("image", newImage);
            }

            // Remove image
            if (removeImage) {
                data.append("removeImage", "true");
            }

            const response = await fetch(
                `${API_URL}/api/items/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: data,
                }
            );

            const result = await response.json();

            if (response.ok) {
                alert("Item updated successfully");

                navigate("/my-items");
            } else {
                setError(
                    result.message || "Unable to update item"
                );
            }
        } catch (error) {
            console.error(error);
            setError("Unable to connect to server");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="details-loading">
                Loading item...
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="edit-item-page">

            <div className="edit-item-container">

                {/* HEADER */}

                <div className="edit-item-header">

                    <h1>✏️ Edit Item</h1>

                    <p>
                        Update the details of your Lost or Found item
                    </p>

                </div>

                {/* ERROR */}

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {/* FORM */}

                <form
                    className="edit-item-form"
                    onSubmit={handleSubmit}
                >

                    {/* ITEM NAME */}

                    <label>Item Name</label>

                    <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        required
                    />

                    {/* DESCRIPTION */}

                    <label>Description</label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />

                    {/* CATEGORY */}

                    <label>Category</label>

                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    />

                    {/* LOCATION */}

                    <label>Location</label>

                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />

                    {/* DATE */}

                    <label>Date</label>

                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />

                    {/* TYPE */}

                    <label>Type</label>

                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Type
                        </option>

                        <option value="Lost">
                            Lost
                        </option>

                        <option value="Found">
                            Found
                        </option>

                    </select>

                    {/* ==========================================
                        IMAGE SECTION
                    ========================================== */}

                    <div className="edit-image-section">

                        <label>Item Image</label>

                        {/* CURRENT IMAGE */}

                        {currentImage && !removeImage ? (

                            <div className="current-image-box">

                                <p>
                                    Current Image
                                </p>

                                <img
                                    src={`${API_URL}/uploads/${currentImage}`}
                                    alt={formData.itemName}
                                    className="current-item-image"
                                />

                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={handleRemoveImage}
                                >
                                    🗑 Remove Image
                                </button>

                            </div>

                        ) : (

                            <div className="no-image-box">

                                <p className="no-image">
                                    📷 No image uploaded
                                </p>

                            </div>

                        )}

                        {/* CHANGE IMAGE */}

                        <label className="change-image-label">
                            Change Image
                        </label>

                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                        />

                        {/* NEW IMAGE PREVIEW */}

                        {newImage && (

                            <div className="new-image-preview">

                                <p>
                                    New Image Preview
                                </p>

                                <img
                                    src={URL.createObjectURL(newImage)}
                                    alt="New preview"
                                    className="current-item-image"
                                />

                            </div>

                        )}

                    </div>

                    {/* ==========================================
                        BUTTONS
                    ========================================== */}

                    <div className="edit-item-actions">

                        <button
                            type="submit"
                            className="update-item-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Updating..."
                                : "✓ Update Item"}
                        </button>

                        <button
                            type="button"
                            className="cancel-item-btn"
                            onClick={() =>
                                navigate("/my-items")
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditItem;