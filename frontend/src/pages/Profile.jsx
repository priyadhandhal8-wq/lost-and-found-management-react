import { useEffect, useState } from "react";
import "./Profile.css";
import API_URL from "../api";

function Profile() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!name.trim()) {
      setMessage("Name cannot be empty");
      return;
    }

    if (!phone.trim()) {
      setMessage("Phone number is required");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setMessage("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);

        setName(data.user.name);
        setPhone(data.user.phone || "");

        // Update localStorage user
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name: data.user.name,
            phone: data.user.phone,
          })
        );

        setMessage("Profile updated successfully! ✅");
        setEditing(false);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="profile-loading">
        Loading Profile...
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (!user) {
    return (
      <div className="profile-error">
        {message || "Unable to load profile."}
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* =========================
            AVATAR
        ========================== */}

        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>

        <h1>{user.name}</h1>

        <p className="profile-role">
          Lost & Found User
        </p>

        {/* =========================
            MESSAGE
        ========================== */}

        {message && (
          <p className="profile-message">
            {message}
          </p>
        )}

        {/* =========================
            VIEW PROFILE
        ========================== */}

        {!editing ? (
          <>
            <div className="profile-info">

              <div className="profile-row">
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>

              <div className="profile-row">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="profile-row">
                <span>Phone</span>
                <strong>
                  {user.phone || "Not added"}
                </strong>
              </div>

            </div>

            <button
              className="edit-profile-btn"
              onClick={() => {
                setEditing(true);
                setMessage("");
                setName(user.name || "");
                setPhone(user.phone || "");
              }}
            >
              Edit Profile
            </button>
          </>
        ) : (

          /* =========================
             EDIT PROFILE
          ========================== */

          <form
            className="profile-edit-form"
            onSubmit={handleUpdateProfile}
          >

            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your name"
            />

            <label>Email</label>

            <input
              type="email"
              value={user.email}
              disabled
            />

            <label>Phone Number</label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;

                // Only allow numbers
                if (/^\d*$/.test(value) && value.length <= 10) {
                  setPhone(value);
                }
              }}
              placeholder="Enter 10 digit phone number"
              maxLength="10"
            />

            <div className="profile-edit-buttons">

              <button
                type="submit"
                className="save-profile-btn"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="cancel-profile-btn"
                onClick={() => {
                  setEditing(false);
                  setName(user.name || "");
                  setPhone(user.phone || "");
                  setMessage("");
                }}
              >
                Cancel
              </button>

            </div>

          </form>
        )}

      </div>

    </div>
  );
}

export default Profile;