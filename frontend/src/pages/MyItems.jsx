import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyItems.css";
import API_URL from "../api";

function MyItems() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // FETCH MY ITEMS
  // ==========================================

  useEffect(() => {
    const fetchMyItems = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/items/my-items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load your items"
          );
        }

        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("My Items Error:", err);

        setError(
          err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [token, navigate]);

  // ==========================================
  // DELETE ITEM
  // ==========================================

  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete item"
        );
      }

      setItems((previousItems) =>
        previousItems.filter(
          (item) => item._id !== itemId
        )
      );

      alert("Item deleted successfully!");
    } catch (err) {
      console.error("Delete Item Error:", err);

      alert(err.message);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="my-items-page">
        <div className="my-items-loading">
          <h2>Loading Your Items...</h2>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="my-items-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="my-items-header">

        <div>
          <h1>My Items</h1>

          <p>
            Manage the lost and found items
            reported by you.
          </p>
        </div>

        <button
          className="back-home-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="my-items-error">
          {error}
        </div>
      )}

      {/* ======================================
          EMPTY
      ====================================== */}

      {!error && items.length === 0 && (
        <div className="empty-my-items">

          <h2>No Items Found</h2>

          <p>
            You haven't reported any lost or found
            items yet.
          </p>

          <div className="empty-actions">

            <button
              onClick={() =>
                navigate("/report-lost")
              }
            >
              Report Lost Item
            </button>

            <button
              onClick={() =>
                navigate("/report-found")
              }
            >
              Report Found Item
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          ITEMS GRID
      ====================================== */}

      {items.length > 0 && (
        <div className="my-items-grid">

          {items.map((item) => (
            <div
              className="my-item-card"
              key={item._id}
            >

              {/* =================================
                  HEADER
              ================================= */}

              <div className="my-item-header">

                <span
                  className={`item-type ${
                    item.type === "Lost"
                      ? "lost"
                      : "found"
                  }`}
                >
                  {item.type || "Item"}
                </span>

                <span
                  className={`item-status ${
                    item.status
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")
                  }`}
                >
                  {item.status || "Active"}
                </span>

              </div>

              {/* =================================
                  CONTENT
              ================================= */}

              <div className="my-item-content">

                <h2>
                  {item.itemName ||
                    "Unnamed Item"}
                </h2>

                <p>
                  <strong>Category:</strong>{" "}
                  {item.category || "N/A"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {item.location || "N/A"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {item.date
                    ? new Date(
                        item.date
                      ).toLocaleDateString()
                    : "N/A"}
                </p>

                {item.description && (
                  <p className="my-item-description">
                    {item.description.length > 100
                      ? `${item.description.substring(
                          0,
                          100
                        )}...`
                      : item.description}
                  </p>
                )}

                {/* =================================
                    ACTION BUTTONS
                ================================= */}

                <div className="my-item-actions">

                  <button
                    className="edit-item-btn"
                    onClick={() =>
                      navigate(
                        `/edit-item/${item._id}`
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-item-btn"
                    onClick={() =>
                      handleDelete(item._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default MyItems;