import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import API_URL from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Contact number loading states
  const [contactLoading, setContactLoading] = useState({});
  const [sharedContacts, setSharedContacts] = useState({});

  const token = localStorage.getItem("token");

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboardData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [itemsResponse, claimsResponse, receivedResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/items/my-items`, {
            headers,
          }),

          fetch(`${API_URL}/api/claims/my-claims`, {
            headers,
          }),

          fetch(`${API_URL}/api/claims/received`, {
            headers,
          }),
        ]);

      // ==========================================
      // CHECK AUTH
      // ==========================================

      if (
        itemsResponse.status === 401 ||
        claimsResponse.status === 401 ||
        receivedResponse.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      // ==========================================
      // ITEMS
      // ==========================================

      const itemsData = await itemsResponse.json();

      if (!itemsResponse.ok) {
        throw new Error(
          itemsData.message || "Failed to load your items"
        );
      }

      // ==========================================
      // MY CLAIMS
      // ==========================================

      const claimsData = await claimsResponse.json();

      if (!claimsResponse.ok) {
        throw new Error(
          claimsData.message || "Failed to load your claims"
        );
      }

      // ==========================================
      // RECEIVED CLAIMS
      // ==========================================

      const receivedData = await receivedResponse.json();

      if (!receivedResponse.ok) {
        throw new Error(
          receivedData.message ||
            "Failed to load received claims"
        );
      }

      setMyItems(Array.isArray(itemsData) ? itemsData : []);
      setMyClaims(Array.isArray(claimsData) ? claimsData : []);
      setReceivedClaims(
        Array.isArray(receivedData) ? receivedData : []
      );

    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "Something went wrong");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ==========================================
  // APPROVE CLAIM
  // ==========================================

  const handleApprove = async (claimId) => {
    const confirmApprove = window.confirm(
      "Are you sure you want to approve this claim?"
    );

    if (!confirmApprove) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/claims/${claimId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to approve claim"
        );
      }

      alert("Claim approved successfully!");

      fetchDashboardData();

    } catch (err) {
      console.error("Approve Claim Error:", err);
      alert(err.message);
    }
  };

  // ==========================================
  // REJECT CLAIM
  // ==========================================

  const handleReject = async (claimId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this claim?"
    );

    if (!confirmReject) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/claims/${claimId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to reject claim"
        );
      }

      alert("Claim rejected successfully!");

      fetchDashboardData();

    } catch (err) {
      console.error("Reject Claim Error:", err);
      alert(err.message);
    }
  };

  // ==========================================
  // REQUEST CONTACT NUMBER
  // ==========================================

  const handleRequestContact = async (claimId) => {
    const confirmRequest = window.confirm(
      "Do you want to request the item owner's contact number?"
    );

    if (!confirmRequest) {
      return;
    }

    try {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: true,
      }));

      const response = await fetch(
        `${API_URL}/api/claims/${claimId}/contact-request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to request contact number"
        );
      }

      alert("Contact number request sent successfully!");

      fetchDashboardData();

    } catch (err) {
      console.error("Request Contact Error:", err);
      alert(err.message);

    } finally {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: false,
      }));
    }
  };

  // ==========================================
  // SHARE CONTACT NUMBER
  // ==========================================

  const handleShareContact = async (claimId) => {
    const confirmShare = window.confirm(
      "Are you sure you want to share your phone number with this claimant?"
    );

    if (!confirmShare) {
      return;
    }

    try {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: true,
      }));

      const response = await fetch(
        `${API_URL}/api/claims/${claimId}/contact-share`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to share contact number"
        );
      }

      alert("Your contact number has been shared.");

      fetchDashboardData();

    } catch (err) {
      console.error("Share Contact Error:", err);
      alert(err.message);

    } finally {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: false,
      }));
    }
  };

  // ==========================================
  // DECLINE CONTACT NUMBER
  // ==========================================

  const handleDeclineContact = async (claimId) => {
    const confirmDecline = window.confirm(
      "Are you sure you don't want to share your contact number?"
    );

    if (!confirmDecline) {
      return;
    }

    try {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: true,
      }));

      const response = await fetch(
        `${API_URL}/api/claims/${claimId}/contact-decline`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to decline contact request"
        );
      }

      alert("Contact request declined.");

      fetchDashboardData();

    } catch (err) {
      console.error("Decline Contact Error:", err);
      alert(err.message);

    } finally {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: false,
      }));
    }
  };

  // ==========================================
  // GET SHARED CONTACT
  // ==========================================

  const handleViewContact = async (claimId) => {
    try {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: true,
      }));

      const response = await fetch(
        `${API_URL}/api/claims/${claimId}/contact`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get contact number"
        );
      }

      setSharedContacts((prev) => ({
        ...prev,
        [claimId]: data,
      }));

    } catch (err) {
      console.error("Get Contact Error:", err);
      alert(err.message);

    } finally {
      setContactLoading((prev) => ({
        ...prev,
        [claimId]: false,
      }));
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="dashboard-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Manage your lost and found items and claims.
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
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-icon">📦</div>

          <div>
            <h3>{myItems.length}</h3>
            <p>My Items</p>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">📩</div>

          <div>
            <h3>{myClaims.length}</h3>
            <p>My Claims</p>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">📋</div>

          <div>
            <h3>{receivedClaims.length}</h3>
            <p>Received Claims</p>
          </div>
        </div>

      </div>


      {/* ======================================
          MY ITEMS
      ====================================== */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>My Items</h2>
            <p>Items reported by you</p>
          </div>

          <button
            className="section-btn"
            onClick={() => navigate("/my-items")}
          >
            View All
          </button>

        </div>


        {myItems.length === 0 ? (

          <div className="empty-card">

            <div className="empty-icon">📦</div>

            <h3>No Items Found</h3>

            <p>
              You haven't reported any lost or found items yet.
            </p>

            <button
              onClick={() => navigate("/report-lost")}
            >
              Report Lost Item
            </button>

          </div>

        ) : (

          <div className="dashboard-grid">

            {myItems.slice(0, 4).map((item) => (

              <div
                className="dashboard-item-card"
                key={item._id}
              >

                <div className="item-card-top">

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


                <h3>{item.itemName}</h3>


                <p>
                  <strong>Category:</strong>{" "}
                  {item.category || "N/A"}
                </p>


                <p>
                  <strong>Location:</strong>{" "}
                  {item.location || "N/A"}
                </p>


                <button
                  className="view-btn"
                  onClick={() =>
                    navigate(`/items/${item._id}`)
                  }
                >
                  View Details
                </button>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ======================================
          MY CLAIMS
      ====================================== */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>My Claims</h2>

            <p>
              Claims submitted by you
            </p>
          </div>

        </div>


        {myClaims.length === 0 ? (

          <div className="empty-card">

            <div className="empty-icon">📩</div>

            <h3>No Claims Yet</h3>

            <p>
              You haven't submitted any claims yet.
            </p>

            <button
              onClick={() => navigate("/items")}
            >
              Browse Items
            </button>

          </div>

        ) : (

          <div className="claims-list">

            {myClaims.map((claim) => (

              <div
                className="claim-card"
                key={claim._id}
              >

                <div className="claim-info">

                  <h3>
                    {claim.item?.itemName ||
                      "Unknown Item"}
                  </h3>

                  <p>
                    {claim.message}
                  </p>

                  <small>
                    Submitted:{" "}
                    {claim.createdAt
                      ? new Date(
                          claim.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </small>

                </div>


                <div
                  className={`claim-status ${
                    claim.status?.toLowerCase()
                  }`}
                >
                  {claim.status || "Pending"}
                </div>


                {/* ==================================
                    CONTACT SECTION FOR CLAIMANT
                ================================== */}

                {claim.status === "Approved" && (
                  <div className="contact-section">

                    <h4>📱 Contact Number</h4>


                    {/* NOT REQUESTED */}

                    {(!claim.contactRequestStatus ||
                      claim.contactRequestStatus === "None") && (

                      <div>

                        <p>
                          Your claim has been approved.
                          You can request the item owner's
                          contact number.
                        </p>

                        <button
                          className="contact-request-btn"
                          disabled={
                            contactLoading[claim._id]
                          }
                          onClick={() =>
                            handleRequestContact(
                              claim._id
                            )
                          }
                        >
                          {contactLoading[claim._id]
                            ? "Sending..."
                            : "Request Contact Number"}
                        </button>

                      </div>

                    )}


                    {/* REQUESTED */}

                    {claim.contactRequestStatus ===
                      "Requested" && (

                      <div className="contact-pending">

                        <p>
                          ⏳ Contact number request sent.
                          Waiting for the item owner.
                        </p>

                      </div>

                    )}


                    {/* DECLINED */}

                    {claim.contactRequestStatus ===
                      "Declined" && (

                      <div className="contact-declined">

                        <p>
                          ❌ The item owner declined to
                          share their contact number.
                        </p>

                      </div>

                    )}


                    {/* SHARED */}

                    {claim.contactRequestStatus ===
                      "Shared" && (

                      <div className="contact-shared">

                        {!sharedContacts[claim._id] ? (

                          <button
                            className="view-contact-btn"
                            disabled={
                              contactLoading[claim._id]
                            }
                            onClick={() =>
                              handleViewContact(
                                claim._id
                              )
                            }
                          >
                            {contactLoading[claim._id]
                              ? "Loading..."
                              : "View Contact Number"}
                          </button>

                        ) : (

                          <div className="shared-contact-info">

                            <p>
                              <strong>Name:</strong>{" "}
                              {sharedContacts[
                                claim._id
                              ].name}
                            </p>

                            <p>
                              <strong>Phone:</strong>{" "}
                              {sharedContacts[
                                claim._id
                              ].phone}
                            </p>

                          </div>

                        )}

                      </div>

                    )}

                  </div>
                )}

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ======================================
          RECEIVED CLAIMS
      ====================================== */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>Received Claims</h2>

            <p>
              Claims submitted for your items
            </p>

          </div>

        </div>


        {receivedClaims.length === 0 ? (

          <div className="empty-card">

            <div className="empty-icon">📋</div>

            <h3>No Received Claims</h3>

            <p>
              No one has submitted a claim on your
              items yet.
            </p>

          </div>

        ) : (

          <div className="received-claims">

            {receivedClaims.map((claim) => (

              <div
                className="received-claim-card"
                key={claim._id}
              >

                {/* ITEM INFORMATION */}

                <div className="received-item">

                  <h3>
                    {claim.item?.itemName ||
                      "Unknown Item"}
                  </h3>

                  <p>
                    <strong>Category:</strong>{" "}
                    {claim.item?.category || "N/A"}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {claim.item?.location || "N/A"}
                  </p>

                </div>


                {/* CLAIMANT INFORMATION */}

                <div className="claimant-info">

                  <h4>Claimed By</h4>

                  <p>
                    <strong>Name:</strong>{" "}
                    {claim.claimedBy?.name ||
                      "Unknown"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {claim.claimedBy?.email ||
                      "N/A"}
                  </p>

                </div>


                {/* CLAIM MESSAGE */}

                <div className="received-message">

                  <h4>Claim Message</h4>

                  <p>
                    {claim.message ||
                      "No message provided."}
                  </p>

                </div>


                {/* STATUS */}

                <div className="received-status">

                  <span
                    className={`claim-status ${
                      claim.status?.toLowerCase()
                    }`}
                  >
                    {claim.status || "Pending"}
                  </span>

                </div>


                {/* ==================================
                    NORMAL CLAIM ACTIONS
                ================================== */}

                {claim.status === "Pending" && (

                  <div className="claim-actions">

                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleApprove(claim._id)
                      }
                    >
                      ✓ Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleReject(claim._id)
                      }
                    >
                      ✕ Reject
                    </button>

                  </div>

                )}


                {/* ==================================
                    CONTACT REQUEST ACTIONS
                ================================== */}

                {claim.status === "Approved" &&
                  claim.contactRequestStatus ===
                    "Requested" && (

                  <div className="contact-owner-actions">

                    <div className="contact-request-message">

                      <h4>
                        📱 Contact Number Request
                      </h4>

                      <p>
                        <strong>
                          {claim.claimedBy?.name ||
                            "The claimant"}
                        </strong>{" "}
                        wants your contact number.
                      </p>

                      <p>
                        You can choose whether or not
                        to share it.
                      </p>

                    </div>


                    <div className="contact-action-buttons">

                      <button
                        className="share-contact-btn"
                        disabled={
                          contactLoading[claim._id]
                        }
                        onClick={() =>
                          handleShareContact(
                            claim._id
                          )
                        }
                      >
                        {contactLoading[claim._id]
                          ? "Sharing..."
                          : "✓ Share Number"}
                      </button>


                      <button
                        className="decline-contact-btn"
                        disabled={
                          contactLoading[claim._id]
                        }
                        onClick={() =>
                          handleDeclineContact(
                            claim._id
                          )
                        }
                      >
                        {contactLoading[claim._id]
                          ? "Please wait..."
                          : "✕ Don't Share"}
                      </button>

                    </div>

                  </div>

                )}


                {/* CONTACT SHARED STATUS FOR OWNER */}

                {claim.status === "Approved" &&
                  claim.contactRequestStatus ===
                    "Shared" && (

                  <div className="contact-owner-shared">

                    <p>
                      ✅ Your contact number has been
                      shared with{" "}
                      <strong>
                        {claim.claimedBy?.name ||
                          "the claimant"}
                      </strong>
                      .
                    </p>

                  </div>

                )}


                {/* CONTACT DECLINED STATUS FOR OWNER */}

                {claim.status === "Approved" &&
                  claim.contactRequestStatus ===
                    "Declined" && (

                  <div className="contact-owner-declined">

                    <p>
                      You chose not to share your
                      contact number.
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;