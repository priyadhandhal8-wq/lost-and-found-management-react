import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminClaims.css";

function AdminClaims() {
    const navigate = useNavigate();

    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingClaim, setEditingClaim] = useState(null);

    const [editMessage, setEditMessage] = useState("");
    const [editStatus, setEditStatus] = useState("Pending");

    const adminToken = localStorage.getItem("adminToken");

    // ==========================================
    // FETCH ALL CLAIMS
    // ==========================================

    const fetchClaims = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/admin/claims",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Server response:", text);

                throw new Error(
                    `Server Error: ${response.status}`
                );
            }

            const data = await response.json();

            setClaims(data);
        } catch (error) {
            console.error("Admin Claims Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
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

        fetchClaims();
    }, [navigate]);

    // ==========================================
    // APPROVE CLAIM
    // ==========================================

    const approveClaim = async (claimId) => {
        const confirmApprove = window.confirm(
            "Are you sure you want to approve this claim?"
        );

        if (!confirmApprove) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/claims/${claimId}/approve`,
                {
                    method: "PUT",
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

            fetchClaims();
        } catch (error) {
            console.error("Approve Claim Error:", error);
            alert("Something went wrong");
        }
    };

    // ==========================================
    // REJECT CLAIM
    // ==========================================

    const rejectClaim = async (claimId) => {
        const confirmReject = window.confirm(
            "Are you sure you want to reject this claim?"
        );

        if (!confirmReject) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/claims/${claimId}/reject`,
                {
                    method: "PUT",
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

            fetchClaims();
        } catch (error) {
            console.error("Reject Claim Error:", error);
            alert("Something went wrong");
        }
    };
    // DELETE CLAIM
    const deleteClaim = async (claimId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this claim?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/claims/${claimId}`,
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

            setClaims((prevClaims) =>
                prevClaims.filter(
                    (claim) => claim._id !== claimId
                )
            );
        } catch (error) {
            console.error("Delete Claim Error:", error);
            alert("Something went wrong");
        }
    };
    //update calim
    const updateClaim = async (claimId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/claims/${claimId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`,
                    },
                    body: JSON.stringify({
                        message: editMessage,
                        status: editStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

            setEditingClaim(null);

            fetchClaims();
        } catch (error) {
            console.error("Update Claim Error:", error);
            alert("Something went wrong");
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="admin-claims">
                <h2>Loading Claims...</h2>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="admin-claims">
                <h1>Manage Claims</h1>

                <p className="claims-error">
                    {error}
                </p>
            </div>
        );
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="admin-claims">
            {editingClaim && (
                <div className="claim-edit-form">

                    <h2>Edit Claim</h2>

                    <p>
                        Item:{" "}
                        <strong>
                            {editingClaim.item?.itemName}
                        </strong>
                    </p>

                    <label>Claim Message</label>

                    <textarea
                        value={editMessage}
                        onChange={(e) =>
                            setEditMessage(e.target.value)
                        }
                        rows="4"
                    />

                    <label>Status</label>

                    <select
                        value={editStatus}
                        onChange={(e) =>
                            setEditStatus(e.target.value)
                        }
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <div className="edit-form-buttons">

                        <button
                            className="update-claim-btn"
                            onClick={() =>
                                updateClaim(editingClaim._id)
                            }
                        >
                            Update Claim
                        </button>

                        <button
                            className="cancel-edit-btn"
                            onClick={() =>
                                setEditingClaim(null)
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </div>
            )}

            {/* HEADER */}

            <div className="claims-header">

                <div>
                    <h1>Manage Claims</h1>

                    <p>
                        Review and manage item claims
                    </p>
                </div>

                <button
                    className="claims-dashboard-btn"
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    ← Dashboard
                </button>

            </div>

            {/* CLAIMS */}

            {claims.length === 0 ? (
                <div className="no-claims">
                    <div>🤝</div>

                    <h2>No Claims Found</h2>

                    <p>
                        There are currently no claims
                        submitted by users.
                    </p>
                </div>
            ) : (
                <div className="claims-table-container">

                    <table>

                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Claimed By</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {claims.map((claim) => (

                                <tr key={claim._id}>

                                    {/* ITEM */}

                                    <td>
                                        <strong>
                                            {claim.item?.itemName ||
                                                "Item Deleted"}
                                        </strong>

                                        <small>
                                            {claim.item?.category ||
                                                "-"}
                                        </small>
                                    </td>

                                    {/* USER */}

                                    <td>
                                        <strong>
                                            {claim.claimedBy?.name ||
                                                "Unknown"}
                                        </strong>

                                        <small>
                                            {claim.claimedBy?.email ||
                                                "-"}
                                        </small>
                                    </td>

                                    {/* MESSAGE */}

                                    <td>
                                        <div className="claim-message">
                                            {claim.message ||
                                                "No message"}
                                        </div>
                                    </td>

                                    {/* DATE */}

                                    <td>
                                        {claim.createdAt
                                            ? new Date(
                                                claim.createdAt
                                            ).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    {/* STATUS */}

                                    <td>
                                        <span
                                            className={`claim-status ${claim.status?.toLowerCase()
                                                }`}
                                        >
                                            {claim.status}
                                        </span>
                                    </td>

                                    {/* ACTION */}


                                    <td>
                                        <div className="claim-actions">

                                            {claim.status === "Pending" && (
                                                <>
                                                    <button
                                                        className="approve-btn"
                                                        onClick={() =>
                                                            approveClaim(claim._id)
                                                        }
                                                    >
                                                        ✓ Approve
                                                    </button>

                                                    <button
                                                        className="reject-btn"
                                                        onClick={() =>
                                                            rejectClaim(claim._id)
                                                        }
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="edit-claim-btn"
                                                onClick={() => {
                                                    setEditingClaim(claim);
                                                    setEditMessage(claim.message || "");
                                                    setEditStatus(claim.status || "Pending");
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                className="delete-claim-btn"
                                                onClick={() =>
                                                    deleteClaim(claim._id)
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

export default AdminClaims;