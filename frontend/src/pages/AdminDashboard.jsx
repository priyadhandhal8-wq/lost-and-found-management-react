
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import API_URL from "../api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    items: 0,
    lostItems: 0,
    foundItems: 0,
    claims: 0,
  });

  const [loading, setLoading] = useState(true);

  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        alert(data.message);

        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Admin Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* Admin Header */}

      <div className="admin-header">

        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Manage Lost & Found Management System
          </p>
        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

      {/* Statistics */}

      <div className="admin-stats">

        <div className="admin-stat-card">
          <span>👥</span>
          <h2>{stats.users}</h2>
          <p>Total Users</p>
        </div>

        <div className="admin-stat-card">
          <span>📦</span>
          <h2>{stats.items}</h2>
          <p>Total Items</p>
        </div>

        <div className="admin-stat-card">
          <span>🔴</span>
          <h2>{stats.lostItems}</h2>
          <p>Lost Items</p>
        </div>

        <div className="admin-stat-card">
          <span>🟢</span>
          <h2>{stats.foundItems}</h2>
          <p>Found Items</p>
        </div>

        <div className="admin-stat-card">
          <span>🤝</span>
          <h2>{stats.claims}</h2>
          <p>Total Claims</p>
        </div>

      </div>

      {/* Admin Management */}

      <div className="admin-management">

        <div className="admin-management-card">

          <div className="management-icon">
            👥
          </div>

          <h2>Manage Users</h2>

          <p>
            View and manage registered users.
          </p>

          <button
            onClick={() =>
              navigate("/admin/users")
            }
          >
            Manage Users
          </button>

        </div>

        <div className="admin-management-card">

          <div className="management-icon">
            📦
          </div>

          <h2>Manage Items</h2>

          <p>
            View and manage lost and found items.
          </p>

          <button
            onClick={() =>
              navigate("/admin/items")
            }
          >
            Manage Items
          </button>

        </div>

        <div className="admin-management-card">

          <div className="management-icon">
            🤝
          </div>

          <h2>Manage Claims</h2>

          <p>
            Review and manage item claims.
          </p>

          <button
            onClick={() =>
              navigate("/admin/claims")
            }
          >
            Manage Claims
          </button>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;

