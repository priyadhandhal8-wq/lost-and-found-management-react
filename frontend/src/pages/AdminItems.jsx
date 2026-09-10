import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminItems.css";
import API_URL from "../api";

function AdminItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    category: "",
    location: "",
    date: "",
    type: "Lost",
    reportedBy: "",
    status: "Active",
  });

  const adminToken = localStorage.getItem("adminToken");

  // ==========================================
  // FETCH ITEMS
  // ==========================================

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/items`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();

      setItems(data);
    } catch (error) {
      console.error("Manage Items Error:", error);
      setError(error.message);
    }
  };

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error("Users Error:", error);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    const loadData = async () => {
      await Promise.all([
        fetchItems(),
        fetchUsers(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const openAddForm = () => {
    setEditingItem(null);

    setFormData({
      itemName: "",
      description: "",
      category: "",
      location: "",
      date: "",
      type: "Lost",
      reportedBy: "",
      status: "Active",
    });

    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (item) => {
    setEditingItem(item);

    setFormData({
      itemName: item.itemName || "",
      description: item.description || "",
      category: item.category || "",
      location: item.location || "",
      date: item.date
        ? item.date.substring(0, 10)
        : "",
      type: item.type || "Lost",
      reportedBy:
        item.reportedBy?._id ||
        item.reportedBy ||
        "",
      status: item.status || "Active",
    });

    setShowForm(true);
  };

  // ==========================================
  // CREATE / UPDATE ITEM
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url =
        `${API_URL}/api/admin/items`;

      let method = "POST";

      if (editingItem) {
        url = `${API_URL}/api/admin/items/${editingItem._id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      setShowForm(false);
      setEditingItem(null);

      await fetchItems();
    } catch (error) {
      console.error("Save Item Error:", error);
      alert("Something went wrong");
    }
  };

  // ==========================================
  // DELETE ITEM
  // ==========================================

  const deleteItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      setItems((prevItems) =>
        prevItems.filter(
          (item) => item._id !== itemId
        )
      );
    } catch (error) {
      console.error("Delete Item Error:", error);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-items">
        <h2>Loading Items...</h2>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="admin-items">
        <h2>Manage Items</h2>

        <p style={{ color: "red" }}>
          {error}
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-items">

      {/* HEADER */}

      <div className="items-header">

        <div>
          <h1>Manage Items</h1>

          <p>
            View and manage lost and found items
          </p>
        </div>

        <div className="items-header-buttons">

          <button
            className="back-dashboard-btn"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Dashboard
          </button>

          <button
            className="add-item-btn"
            onClick={openAddForm}
          >
            + Add Item
          </button>

        </div>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="item-form-card">

          <div className="form-header">

            <h2>
              {editingItem
                ? "Edit Item"
                : "Add New Item"}
            </h2>

            <button
              className="close-form-btn"
              onClick={() =>
                setShowForm(false)
              }
            >
              ✕
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="item-form-grid">

              {/* ITEM NAME */}

              <div className="form-group">
                <label>Item Name</label>

                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                />
              </div>

              {/* CATEGORY */}

              <div className="form-group">
                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              {/* LOCATION */}

              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  required
                />
              </div>

              {/* DATE */}

              <div className="form-group">
                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* TYPE */}

              <div className="form-group">
                <label>Type</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Lost">
                    Lost
                  </option>

                  <option value="Found">
                    Found
                  </option>
                </select>
              </div>

              {/* REPORTED BY */}

              <div className="form-group">
                <label>Reported By</label>

                <select
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select User
                  </option>

                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Claimed">
                    Claimed
                  </option>

                  <option value="Closed">
                    Closed
                  </option>
                </select>
              </div>

              {/* DESCRIPTION */}

              <div className="form-group full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description"
                  rows="4"
                  required
                />
              </div>

            </div>

            <div className="form-buttons">

              <button
                type="submit"
                className="save-item-btn"
              >
                {editingItem
                  ? "Update Item"
                  : "Create Item"}
              </button>

              <button
                type="button"
                className="cancel-item-btn"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ITEMS TABLE */}

      {items.length === 0 ? (
        <div className="no-items">
          <h2>No Items Found</h2>
        </div>
      ) : (
        <div className="items-table-container">

          <table>

            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Location</th>
                <th>Type</th>
                <th>Date</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {items.map((item) => (
                <tr key={item._id}>

                  <td>
                    <strong>
                      {item.itemName}
                    </strong>

                    <small>
                      {item.description}
                    </small>
                  </td>

                  <td>
                    {item.category}
                  </td>

                  <td>
                    {item.location}
                  </td>

                  <td>
                    <span
                      className={`type-badge ${
                        item.type === "Lost"
                          ? "lost"
                          : "found"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td>
                    {item.date
                      ? new Date(
                          item.date
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {item.reportedBy?.name ||
                      "Unknown"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${item.status?.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>

                    <div className="item-actions">

                      <button
                        className="edit-item-btn"
                        onClick={() =>
                          openEditForm(item)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-item-btn"
                        onClick={() =>
                          deleteItem(item._id)
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default AdminItems;