import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Items.css";
import API_URL from "../api";

function Items() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Fixed categories
  const categories = [
    "Jewellery",
    "Mobile",
    "Wallet",
    "Bag",
    "Documents",
    "Electronics",
    "Clothing",
    "Keys",
    "Books",
    "Other",
  ];

  // Fetch Items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/items`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load items"
          );
        }

        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Items Error:", err);

        setError(
          err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Search + Filter
  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    const itemName =
      item.itemName?.toLowerCase() || "";

    const description =
      item.description?.toLowerCase() || "";

    const location =
      item.location?.toLowerCase() || "";

    const category =
      item.category?.toLowerCase() || "";

    const type =
      item.type?.toLowerCase() || "";

    // Search condition
    const matchesSearch =
      search === "" ||
      itemName.includes(search) ||
      description.includes(search) ||
      location.includes(search) ||
      category.includes(search) ||
      type.includes(search);

    // Lost / Found condition
    const matchesType =
      typeFilter === "All" ||
      item.type === typeFilter;

    // Category condition
    const matchesCategory =
      categoryFilter === "All" ||
      item.category === categoryFilter;

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory
    );
  });

  // Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("All");
    setCategoryFilter("All");
  };

  // Loading
  if (loading) {
    return (
      <div className="items-page">
        <div className="items-loading">
          <h2>Loading Items...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="items-page">

      {/* ================= HEADER ================= */}

      <div className="items-header">

        <div>
          <h1>Lost & Found Items</h1>

          <p>
            Browse all reported lost and found items.
          </p>
        </div>

        <button
          className="back-home-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>


      {/* ================= ERROR ================= */}

      {error && (
        <div className="items-error">
          {error}
        </div>
      )}


      {/* ================= SEARCH & FILTER ================= */}

      {!error && items.length > 0 && (
        <>
          <div className="items-filters">

            {/* Search */}

            <div className="filter-search">

              <input
                type="text"
                placeholder="Search item, location, category..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

            </div>


            {/* Lost / Found */}

            <div className="filter-group">

              <label>Type</label>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
              >

                <option value="All">
                  All
                </option>

                <option value="Lost">
                  Lost
                </option>

                <option value="Found">
                  Found
                </option>

              </select>

            </div>


            {/* Category */}

            <div className="filter-group">

              <label>Category</label>

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
              >

                <option value="All">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </div>


            {/* Clear */}

            <button
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          {/* ================= RESULT COUNT ================= */}

          <div className="items-result-count">

            Showing{" "}

            <strong>
              {filteredItems.length}
            </strong>

            {" "}of{" "}

            <strong>
              {items.length}
            </strong>

            {" "}items

          </div>

        </>
      )}


      {/* ================= NO ITEMS ================= */}

      {!error && items.length === 0 && (
        <div className="empty-items">

          <h2>No Items Available</h2>

          <p>
            There are currently no lost or found items.
          </p>

          <button
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

        </div>
      )}


      {/* ================= NO SEARCH RESULT ================= */}

      {!error &&
        items.length > 0 &&
        filteredItems.length === 0 && (

          <div className="no-results">

            <h2>No Matching Items</h2>

            <p>
              No items match your search or selected
              filters.
            </p>

            <button
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

        )}


      {/* ================= ITEMS GRID ================= */}

      {!error &&
        filteredItems.length > 0 && (

          <div className="items-grid">

            {filteredItems.map((item) => (

              <div
                className="item-card"
                key={item._id}
              >

                {/* Card Header */}

                <div className="item-card-header">

                  <span
                    className={`item-type ${
                      item.type === "Lost"
                        ? "lost"
                        : "found"
                    }`}
                  >
                    {item.type || "Item"}
                  </span>

                  <span className="item-status">
                    {item.status || "Active"}
                  </span>

                </div>


                {/* Card Content */}

                <div className="item-card-content">

                  <h2>
                    {item.itemName ||
                      "Unnamed Item"}
                  </h2>


                  <p>
                    <strong>
                      Category:
                    </strong>{" "}

                    {item.category || "N/A"}
                  </p>


                  <p>
                    <strong>
                      Location:
                    </strong>{" "}

                    {item.location || "N/A"}
                  </p>


                  <p>
                    <strong>
                      Date:
                    </strong>{" "}

                    {item.date
                      ? new Date(
                          item.date
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>


                  {item.description && (
                    <p className="item-description">

                      {item.description.length > 100
                        ? `${item.description.substring(
                            0,
                            100
                          )}...`
                        : item.description}

                    </p>
                  )}


                  <button
                    className="view-details-btn"
                    onClick={() =>
                      navigate(
                        `/items/${item._id}`
                      )
                    }
                  >
                    View Details
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

    </div>
  );
}

export default Items;