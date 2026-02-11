import "../styles/Emergency.css";
import { emergencyHelplines, floodShelters } from "../data/emergencyData";

export default function Emergency() {
  return (
    <div className="emergency-page">
      <div className="emergency-container">
        <h1 className="page-title">Emergency Information</h1>
        <p className="page-subtitle">
          Flood Response Support for Chenab River
        </p>

        <div className="emergency-grid">
          {/* LEFT COLUMN */}
          <div className="helpline-section">
            <h2>Emergency Helpline Numbers</h2>

            {emergencyHelplines.map((item, i) => (
              <div className="helpline-card" key={i}>
                <div>
                  <p className="helpline-name">{item.name}</p>
                  <p className="helpline-number">
                    <span className="phone-inline">📞</span>
                    {item.number}
                </p>

                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN */}
          <div className="shelter-section">
            <h2>Flood Shelters</h2>

            {floodShelters.map((shelter, i) => (
              <div className="shelter-card" key={i}>
                <div className="shelter-header">
                  <h3>{shelter.name}</h3>
                  <span
                    className={
                      shelter.status === "Available"
                        ? "status available"
                        : "status full"
                    }
                  >
                    {shelter.status}
                  </span>
                </div>

                <p className="shelter-info">📍 {shelter.location}</p>
                <p className="shelter-info">👥 {shelter.capacity}</p>

                <div className="facility-row">
                  {shelter.facilities.map((f, idx) => (
                    <span className="facility" key={idx}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
