import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import API_URL from "../api";

function Settings() {
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  const user = getUser();

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setMessage("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const token = localStorage.getItem("token");

    // Check login
    if (!token) {
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    // Check fields
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError("Please fill all password fields");
      return;
    }

    // Password length
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    // Confirm password
    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setError("New passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/users/change-password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword:
              passwordData.currentPassword,

            newPassword:
              passwordData.newPassword,
          }),
        }
      );

      /*
        Read response safely.
        This prevents:
        Unexpected token '<'
      */

      const text = await response.text();

      let data = {};

      try {
        data = JSON.parse(text);
      } catch {
        data = {
          message: "Invalid response from server",
        };
      }

      // Success
      if (response.ok) {
        setMessage(
          data.message ||
          "Password changed successfully!"
        );

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          setShowPasswordForm(false);
          setMessage("");
        }, 2000);

        return;
      }

      // Unauthorized / expired token
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      // Other errors
      setError(
        data.message ||
        "Unable to change password"
      );
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="settings-page">
      <button
        className="settings-back-home-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </button>

      <div className="settings-container">

        {/* Heading */}

        <h1>Settings</h1>

        <p className="settings-subtitle">
          Manage your account and security settings
        </p>

        {/* =========================
            ACCOUNT
        ========================== */}

        <div className="settings-card">

          <h2>Account</h2>

          <div className="setting-item">

            <div>
              <h3>Profile</h3>

              <p>
                Update your personal profile
                information.
              </p>
            </div>

            <button
              className="settings-btn"
              onClick={() =>
                navigate("/profile")
              }
            >
              View Profile
            </button>

          </div>

        </div>

        {/* =========================
            SECURITY
        ========================== */}

        <div className="settings-card">

          <h2>Security</h2>

          <div className="setting-item">

            <div>
              <h3>Change Password</h3>

              <p>
                Update your account password
                securely.
              </p>
            </div>

            <button
              className="settings-btn"
              onClick={() => {
                setShowPasswordForm(
                  !showPasswordForm
                );

                setError("");
                setMessage("");
              }}
            >
              {showPasswordForm
                ? "Cancel"
                : "Change Password"}
            </button>

          </div>

          {/* Password Form */}

          {showPasswordForm && (

            <form
              className="password-form"
              onSubmit={
                handleChangePassword
              }
            >

              <label>
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={
                  passwordData.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
              />

              <label>
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={
                  passwordData.newPassword
                }
                onChange={
                  handlePasswordChange
                }
              />

              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={
                  passwordData.confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
              />

              <button
                type="submit"
                className="save-password-btn"
              >
                Update Password
              </button>

            </form>
          )}

          {/* Error */}

          {error && (
            <p className="settings-error">
              {error}
            </p>
          )}

          {/* Success */}

          {message && (
            <p className="settings-success">
              {message}
            </p>
          )}

        </div>

        {/* =========================
            ACCOUNT INFORMATION
        ========================== */}

        <div className="settings-card">

          <h2>Account Information</h2>

          <div className="account-info">

            <p>
              <strong>Name:</strong>{" "}
              {user?.name || "User"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {user?.email ||
                "Not available"}
            </p>

          </div>

        </div>

        {/* =========================
            LOGOUT
        ========================== */}

        <div className="settings-card danger-card">

          <h2>Account Actions</h2>

          <div className="setting-item">

            <div>
              <h3>Logout</h3>

              <p>
                Sign out from your account.
              </p>
            </div>

            <button
              className="settings-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Settings;