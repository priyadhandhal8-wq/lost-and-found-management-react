import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Claim.css";
import API_URL from "../api";

function Claim() {
    const { itemId } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setError("Please enter a claim message.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/claims/${itemId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: message.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit claim");
            }

            setSuccess("Claim submitted successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="claim-page">
            <div className="claim-card">
                <h1>Claim Item</h1>

                <p className="claim-info">
                    Please provide a reason or proof that this item belongs to you.
                </p>

                <form onSubmit={handleSubmit}>
                    <label>Claim Message</label>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Explain why you believe this item belongs to you..."
                        rows="6"
                    />

                    {error && <p className="claim-error">{error}</p>}

                    {success && <p className="claim-success">{success}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Claim"}
                    </button>

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Claim;