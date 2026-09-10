import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const adminToken = localStorage.getItem("adminToken");

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      if (!adminToken) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Server response:", text);

        throw new Error(
          `Server Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      setUsers(data);
      setError("");
    } catch (err) {
      console.error("Manage Users Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // FORM INPUT
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
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });

    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const openEditForm = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
    });

    setShowForm(true);
  };

  // ==========================================
  // CREATE / UPDATE USER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = "http://localhost:5000/api/admin/users";
      let method = "POST";

      if (editingUser) {
        url = `http://localhost:5000/api/admin/users/${editingUser._id}`;
        method = "PUT";
      }

      const body = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Password sirf create ke time bhejna
      if (!editingUser) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      setShowForm(false);
      setEditingUser(null);

      fetchUsers();
    } catch (error) {
      console.error("Save User Error:", error);
      alert("Something went wrong");
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
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

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
    } catch (error) {
      console.error("Delete User Error:", error);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-users">
        <h2>Loading Users...</h2>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="admin-users">
        <h2>Manage Users</h2>

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
    <div className="admin-users">

      {/* HEADER */}

      <div className="users-header">

        <div>
          <h1>Manage Users</h1>
          <p>View and manage registered users</p>
        </div>

        <div className="users-header-buttons">

          <button
            className="back-dashboard-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            className="add-user-btn"
            onClick={openAddForm}
          >
            + Add User
          </button>

        </div>

      </div>

      {/* ADD / EDIT FORM */}

      {showForm && (
        <div className="user-form-card">

          <div className="form-header">

            <h2>
              {editingUser
                ? "Edit User"
                : "Add New User"}
            </h2>

            <button
              className="close-form-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Role</label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">
                    User
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>

            </div>

            <div className="form-buttons">

              <button
                type="submit"
                className="save-user-btn"
              >
                {editingUser
                  ? "Update User"
                  : "Create User"}
              </button>

              <button
                type="button"
                className="cancel-user-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* USERS TABLE */}

      {users.length === 0 ? (
        <div className="no-users">
          <h2>No Users Found</h2>
        </div>
      ) : (
        <div className="users-table-container">

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {users.map((user) => (
                <tr key={user._id}>

                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={`role-badge ${
                        user.role || "user"
                      }`}
                    >
                      {user.role || "user"}
                    </span>
                  </td>

                  <td>

                    <div className="user-actions">

                      <button
                        className="edit-user-btn"
                        onClick={() =>
                          openEditForm(user)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-user-btn"
                        onClick={() =>
                          deleteUser(user._id)
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

export default AdminUsers;