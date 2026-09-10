import { Link } from "react-router-dom";
import "./Home.css";
import Navbar from "../components/Navbar";

function Home() {
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
    user = null;
  }

  return (
    <div className="home">

      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">

          {/* Welcome User */}
          <div className="welcome-user">
            Welcome{user?.name ? `, ${user.name}` : ""} 👋
          </div>

          <h1>Lost & Found Management System</h1>

          <p>
            Lost something? Found something?
            <br />
            Help reunite lost items with their rightful owners.
          </p>

          <div className="hero-buttons">

            <Link to="/report-lost" className="hero-btn">
              Report Lost Item
            </Link>

            <Link to="/report-found" className="hero-btn secondary">
              Report Found Item
            </Link>

          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="features">

        <h2>How It Works</h2>

        <div className="feature-container">

          <div className="feature-card">
            <div className="icon">📢</div>

            <h3>Report</h3>

            <p>
              Report your lost or found item with complete details.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">🔍</div>

            <h3>Search</h3>

            <p>
              Search and filter reported items easily.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">🤝</div>

            <h3>Claim</h3>

            <p>
              Submit a claim and help return the item to its owner.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;