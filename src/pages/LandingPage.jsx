import "../styles/LandingPage.css";

const imgFrame1 = "https://www.figma.com/api/mcp/asset/29cb15ca-35b3-4aaa-93ae-23a8b2462bf7";

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Background Image */}
      <div className="background-image-wrapper">
        <img alt="flood background" className="background-image" src={imgFrame1} />
        <div className="background-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">C Guard</div>

        <ul className="nav-links">
          <li className="nav-item active">Home</li>
          <li className="nav-item">Map</li>
          <li className="nav-item">Emergency</li>
          <li className="nav-item">Contacts</li>
        </ul>

        <button className="login-btn">Authority Login</button>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">Chenab Guard</h1>
          <h3 className="hero-subtitle">Flood Forecasting & Early Warning System</h3>

          <p className="hero-description">
            Protecting lives with early flood risk insights and timely warnings
            to support safer communities along the Chenab River Basin.
          </p>

          <button className="cta-btn">Check Flood Risk</button>
        </div>
      </div>
    </div>
  );
}
