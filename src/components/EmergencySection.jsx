import React from 'react';
import '../styles/EmergencySection.css';
import { emergencyHelplines, floodShelters } from "../data/emergencyData";

const EmergencySection = () => {
  return (
    <section id="emergency" className="emergency-section-wrapper">
      <div className="emergency-container-main">
        <div className="emergency-header">
          <h2 className="section-title">Emergency Information</h2>
          <p className="section-subtitle">
            Flood Response Support for Chenab River
          </p>
        </div>

        <div className="emergency-grid">
          {/* LEFT COLUMN */}
          <div className="helpline-section">
            <h3>Emergency Helpline Numbers</h3>

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
            <h3>Flood Shelters</h3>

            {floodShelters.map((shelter, i) => (
              <div className="shelter-card" key={i}>
                <div className="shelter-header">
                  <h4>{shelter.name}</h4>
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
    </section>
  );
};

export default EmergencySection;
