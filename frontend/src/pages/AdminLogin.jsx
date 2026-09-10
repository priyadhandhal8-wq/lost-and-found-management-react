import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import API_URL from "../api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!email || !password) {
      setMessage("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save admin token separately
        localStorage.setItem(
          "adminToken",
          data.token
        );

        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );

        navigate("/admin/dashboard");
      } else {
        setMessage(
          data.message || "Admin login failed"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-icon">
          👑
        </div>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Lost & Found Management System
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {message && (
            <p className="admin-login-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Admin Login"}
          </button>

        </form>

        <button
          className="back-login-btn"
          onClick={() => navigate("/login")}
        >
          Back to User Login
        </button>

      </div>

    </div>
  );
}

export default AdminLogin;