import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ItemDetails.css";
import API_URL from "../api";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);

  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");

  // ==========================================
  // CLAIM STATES
  // ==========================================

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessageStatus, setClaimMessageStatus] = useState("");
  const [claimMessageType, setClaimMessageType] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  // ==========================================
  // CHECK ITEM OWNER
  // ==========================================

  const isOwnItem = () => {
    if (!item) {
      return false;
    }

    const storedUser = getStoredUser();

    // Your localStorage has "id"
    // but some places may use "_id"
    const currentUserId =
      storedUser?.id ||
      storedUser?._id ||
      storedUser?.userId;

    if (!currentUserId) {
      return false;
    }

    // reportedBy can be:
    // 1. Object: { _id: "..." }
    // 2. Object: { id: "..." }
    // 3. Direct MongoDB ID string
    const reportedById =
      item.reportedBy?._id ||
      item.reportedBy?.id ||
      item.reportedBy?.userId ||
      item.reportedBy;

    if (!reportedById) {
      return false;
    }

    return (
      String(currentUserId) ===
      String(reportedById)
    );
  };

  // ==========================================
  // GET ITEM DETAILS
  // ==========================================

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/items/${id}`
      );

      const data = await response.json();

      if (response.ok) {
        setItem(data);

        // Fetch matching items
        fetchMatches();
      } else {
        setError(data.message || "Item not found");
      }
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GET MATCHING ITEMS
  // ==========================================

  const fetchMatches = async () => {
    try {
      setMatchLoading(true);
      setMatchError("");

      const response = await fetch(
        `${API_URL}/api/items/${id}/matches`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMatches(data.matches || []);
      } else {
        setMatchError(
          data.message || "Unable to find matches"
        );
      }
    } catch (error) {
      console.error("MATCH FETCH ERROR:", error);

      setMatchError("Unable to load matching items");
    } finally {
      setMatchLoading(false);
    }
  };

  // ==========================================
  // SUBMIT CLAIM
  // ==========================================

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    setClaimMessageStatus("");
    setClaimMessageType("");

    if (!token) {
      navigate("/login");
      return;
    }

    // EXTRA SAFETY:
    // User cannot claim their own item
    if (isOwnItem()) {
      setClaimMessageStatus(
        "You cannot claim your own reported item."
      );
      setClaimMessageType("error");
      return;
    }

    if (!claimMessage.trim()) {
      setClaimMessageStatus(
        "Please explain why this item belongs to you."
      );
      setClaimMessageType("error");
      return;
    }

    try {
      setClaimLoading(true);

      const response = await fetch(
        `${API_URL}/api/claims/${item._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: claimMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setClaimMessageStatus(
          data.message || "Unable to submit claim."
        );

        setClaimMessageType("error");
        return;
      }

      setClaimMessageStatus(
        "Claim submitted successfully!"
      );

      setClaimMessageType("success");

      setClaimMessage("");
      setShowClaimForm(false);
    } catch (error) {
      console.error("CLAIM ERROR:", error);

      setClaimMessageStatus(
        "Unable to connect to server."
      );

      setClaimMessageType("error");
    } finally {
      setClaimLoading(false);
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
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="details-error">
        {error}
      </div>
    );
  }

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (image) => {
    if (!image) return null;

    return `${API_URL}/uploads/${image}`;
  };

  // ==========================================
  // VIEW
  // ==========================================

  return (
    <div className="item-details-page">

      <div className="item-details-card">

        {/* BACK BUTTON */}

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* ======================================
            MAIN ITEM DETAILS
        ====================================== */}

        <div className="item-details-content">

          {/* IMAGE */}

          <div className="item-details-image">

            {item.image ? (
              <img
                src={getImageUrl(item.image)}
                alt={item.itemName}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="no-image">
                📷
                <span>No Image Available</span>
              </div>
            )}

          </div>

          {/* INFORMATION */}

          <div className="item-information">

            <div className="item-badges">

              <span
                className={
                  item.type === "Lost"
                    ? "lost-badge"
                    : "found-badge"
                }
              >
                {item.type}
              </span>

              <span className="status-badge">
                {item.status}
              </span>

            </div>

            <h1>{item.itemName}</h1>

            <p className="description">
              {item.description}
            </p>

            <div className="detail-row">
              <strong>Location:</strong>
              <span>{item.location}</span>
            </div>

            <div className="detail-row">
              <strong>Date:</strong>
              <span>
                {new Date(
                  item.date
                ).toLocaleDateString()}
              </span>
            </div>

            <div className="detail-row">
              <strong>Category:</strong>
              <span>{item.category}</span>
            </div>

            {/* ==================================
                OWN ITEM MESSAGE
            ================================== */}

            {isOwnItem() && (
              <div className="owner-item-message">
                You reported this item, so you cannot claim it.
              </div>
            )}

            {/* ==================================
                CLAIM SECTION
            ================================== */}

            {!isOwnItem() &&
              token && (
                <div className="claim-section">

                  {!showClaimForm ? (

                    <button
                      className="claim-item-btn"
                      onClick={() => {

                        // Extra check before opening form
                        if (isOwnItem()) {
                          return;
                        }

                        setShowClaimForm(true);
                        setClaimMessageStatus("");
                        setClaimMessageType("");
                      }}
                    >
                      📩 Claim This Item
                    </button>

                  ) : (

                    <form
                      className="claim-form"
                      onSubmit={handleClaimSubmit}
                    >

                      <h3>
                        Claim This Item
                      </h3>

                      <p>
                        Explain why you believe this
                        item belongs to you.
                      </p>

                      <textarea
                        value={claimMessage}
                        onChange={(e) =>
                          setClaimMessage(
                            e.target.value
                          )
                        }
                        placeholder="Example: This is my phone. It has a blue cover and my initials are written on the back..."
                        rows="5"
                        disabled={claimLoading}
                      />

                      <div className="claim-form-actions">

                        <button
                          type="submit"
                          className="submit-claim-btn"
                          disabled={claimLoading}
                        >
                          {claimLoading
                            ? "Submitting..."
                            : "Submit Claim"}
                        </button>

                        <button
                          type="button"
                          className="cancel-claim-btn"
                          onClick={() => {
                            setShowClaimForm(false);
                            setClaimMessage("");
                          }}
                          disabled={claimLoading}
                        >
                          Cancel
                        </button>

                      </div>

                    </form>

                  )}

                  {claimMessageStatus && (

                    <div
                      className={`claim-status-message ${
                        claimMessageType ===
                        "success"
                          ? "success"
                          : "error"
                      }`}
                    >
                      {claimMessageStatus}
                    </div>

                  )}

                </div>

              )}

            {/* ==================================
                LOGIN USER
            ================================== */}

            {!isOwnItem() &&
              !token && (

                <div className="login-to-claim">

                  <p>
                    Login to claim this item.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/login")
                    }
                  >
                    Login
                  </button>

                </div>

              )}

          </div>

        </div>

        {/* ======================================
            POSSIBLE MATCHES
        ====================================== */}

        <div className="matches-section">

          <div className="matches-header">

            <h2>🔍 Possible Matches</h2>

            <p>
              Items that may match this{" "}
              {item.type === "Lost"
                ? "lost"
                : "found"}{" "}
              item
            </p>

          </div>

          {/* MATCH LOADING */}

          {matchLoading && (
            <div className="matches-loading">
              Finding possible matches...
            </div>
          )}

          {/* MATCH ERROR */}

          {!matchLoading &&
            matchError && (
              <div className="matches-error">
                {matchError}
              </div>
            )}

          {/* NO MATCH */}

          {!matchLoading &&
            !matchError &&
            matches.length === 0 && (

              <div className="no-matches">

                <div className="no-match-icon">
                  🔎
                </div>

                <h3>
                  No matching items found
                </h3>

                <p>
                  We couldn't find any possible
                  matches for this item yet.
                </p>

              </div>

            )}

          {/* MATCH CARDS */}

          {!matchLoading &&
            !matchError &&
            matches.length > 0 && (

              <div className="matches-grid">

                {matches.map((match) => {

                  // Check whether current user
                  // reported this matched item
                  const storedUser = getStoredUser();

                  const currentUserId =
                    storedUser?.id ||
                    storedUser?._id ||
                    storedUser?.userId;

                  const matchReportedById =
                    match.reportedBy?._id ||
                    match.reportedBy?.id ||
                    match.reportedBy?.userId ||
                    match.reportedBy;

                  const isOwnMatch =
                    currentUserId &&
                    matchReportedById &&
                    String(currentUserId) ===
                    String(matchReportedById);

                  return (
                    <div
                      className="match-card"
                      key={match._id}
                    >

                      {/* MATCH IMAGE */}

                      <div className="match-image">

                        {match.image ? (

                          <img
                            src={getImageUrl(
                              match.image
                            )}
                            alt={match.itemName}
                            onError={(e) => {
                              e.target.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <div className="match-no-image">
                            📷
                          </div>

                        )}

                      </div>

                      {/* MATCH CONTENT */}

                      <div className="match-content">

                        <div className="match-top">

                          <span
                            className={
                              match.type === "Lost"
                                ? "lost-badge"
                                : "found-badge"
                            }
                          >
                            {match.type}
                          </span>

                          <span className="match-score">
                            🎯 {match.matchScore}% Match
                          </span>

                        </div>

                        <h3>
                          {match.itemName}
                        </h3>

                        <p className="match-description">
                          {match.description}
                        </p>

                        <div className="match-details">

                          <div>
                            <strong>
                              Category:
                            </strong>

                            <span>
                              {match.category}
                            </span>
                          </div>

                          <div>
                            <strong>
                              Location:
                            </strong>

                            <span>
                              {match.location}
                            </span>
                          </div>

                          <div>
                            <strong>
                              Date:
                            </strong>

                            <span>
                              {new Date(
                                match.date
                              ).toLocaleDateString()}
                            </span>
                          </div>

                        </div>

                        {/* BUTTONS */}

                        <div className="match-actions">

                          <button
                            className="view-match-btn"
                            onClick={() =>
                              navigate(
                                `/items/${match._id}`
                              )
                            }
                          >
                            👁️ View Details
                          </button>

                          {/* CLAIM ONLY IF:
                              1. Match is Found
                              2. Current user did NOT report it
                          */}

                          {match.type === "Found" &&
                            !isOwnMatch && (

                              <button
                                className="claim-match-btn"
                                onClick={() =>
                                  navigate(
                                    `/items/${match._id}`
                                  )
                                }
                              >
                                📩 Claim
                              </button>

                            )}

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

        </div>

      </div>

    </div>
  );
}

export default ItemDetails;