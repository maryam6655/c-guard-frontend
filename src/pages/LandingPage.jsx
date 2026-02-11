import "../styles/LandingPage.css";

const imgFrame1 = "/flood.jpg";

export default function LandingPage({ onCheckFloodRisk }) {
  const handleCheckFloodRisk = () => {
    if (onCheckFloodRisk) {
      onCheckFloodRisk();
    } else {
      // Fallback to scroll behavior if prop not provided
      const mapSection = document.getElementById('map');
      if (mapSection) {
        window.scrollTo({
          top: mapSection.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <section id="home" className="landing-container">
      {/* Background Image */}
      <div className="background-image-wrapper">
        <img alt="flood background" className="background-image" src={imgFrame1} />
        <div className="background-overlay"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">Chenab Guard</h1>
          <h3 className="hero-subtitle">Flood Forecasting & Early Warning System</h3>

          <p className="hero-description">
            Protecting lives with early flood risk insights and timely warnings
            to support safer communities along the Chenab River Basin.
          </p>

          <button className="cta-btn" onClick={handleCheckFloodRisk}>Check Flood Risk</button>
        </div>
      </div>
    </section>
  );
}
