import React, { useState } from 'react';
import { FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import FloodMap from '../components/FloodMap';
import CGuardLogoIcon from '../components/CGuardLogoIcon';
import UCFloodRiskPopup from '../components/UCFloodRiskPopup';
import '../styles/FloodRiskPage.css';

// Dummy location data for user (simulating location detection)
const dummyUserLocation = {
  uc: 'UC XYZ',
  district: 'Hafizabad',
  lat: 32.05,
  lng: 74.35,
  floodRisk: {
    twentyFourHour: 48,
    fortyEightHour: 58,
    seventyTwoHour: 40
  }
};

const FloodRiskPage = ({ onBackToHome, onViewShelters }) => {
  const [userLocation, setUserLocation] = useState(dummyUserLocation);
  const [locationPrompt, setLocationPrompt] = useState(true);
  const [mapLocation, setMapLocation] = useState(null);
  const [showRiverLayer, setShowRiverLayer] = useState(true);
  const [showUcBoundaries, setShowUcBoundaries] = useState(true);
  const [statusText, setStatusText] = useState('Waiting for live data');
  const [selectedUC, setSelectedUC] = useState({
    uc: 'UC XYZ',
    district: 'Hafizabad',
    risk24: 48,
    risk48: 58,
    risk72: 40,
  });
  const [locationLabel, setLocationLabel] = useState('Your Location');
  const [locationTime, setLocationTime] = useState(() => new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const formatLocationTime = (date = new Date()) =>
    date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

  // Handle location sharing
  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setLocationPrompt(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        setMapLocation([latitude, longitude]);
        setLocationLabel(locationText);
        setLocationTime(formatLocationTime());
        setUserLocation((prev) => ({
          ...(prev || dummyUserLocation),
          lat: latitude,
          lng: longitude,
        }));
        setLocationPrompt(false);
      },
      () => {
        setLocationLabel('Location unavailable');
        setLocationTime(formatLocationTime());
        setLocationPrompt(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Voice search
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      
      recognition.start();
    } else {
      alert('Voice search is not supported in your browser.');
    }
  };

  // Get progress bar color
  const getProgressColor = (percentage) => {
    if (percentage > 75) return '#dc2626';
    if (percentage >= 50) return '#ea580c';
    if (percentage >= 25) return '#facc15';
    return '#22c55e';
  };

  const clampRisk = (value) => Math.max(0, Math.min(100, Math.round(value)));

  const handleUcSelect = (selection) => {
    if (!selection) return;

    const baseRisk = selection.riskPercentage != null
      ? Number(selection.riskPercentage)
      : selection.discharge != null
        ? (Number(selection.discharge) / 50000) * 100
        : 40;

    const risk24 = clampRisk(baseRisk - 8);
    const risk48 = clampRisk(baseRisk);
    const risk72 = clampRisk(baseRisk - 14);

    setSelectedUC({
      uc: selection.ucName || 'Unknown UC',
      district: selection.district || 'Unknown District',
      risk24,
      risk48,
      risk72,
    });

    setUserLocation((prev) => ({
      ...(prev || dummyUserLocation),
      uc: selection.ucName || 'Unknown UC',
      district: selection.district || 'Unknown District',
      floodRisk: {
        twentyFourHour: risk24,
        fortyEightHour: risk48,
        seventyTwoHour: risk72,
      },
    }));
  };

  const handleLiveUpdate = ({ lastUpdated, liveError, loadingLive }) => {
    if (loadingLive) {
      setStatusText('Refreshing live data...');
      return;
    }

    if (liveError) {
      setStatusText('Waiting for live data');
      return;
    }

    if (lastUpdated) {
      setStatusText(`Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      return;
    }

    setStatusText('Waiting for live data');
  };

  const handleViewShelters = () => {
    setShowPopup(false);
    if (onViewShelters) {
      onViewShelters(userLocation || dummyUserLocation);
    }
  };

  return (
    <div className="flood-risk-page">
      {/* Header */}
      <div className="flood-risk-header">
        <div className="header-left">
          <div className="header-brand">
            <span className="header-logo-icon" aria-hidden="true">
              <CGuardLogoIcon size={34} />
            </span>
            <h1 className="page-title">C Guard | Chenab Basin</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
          <div className="user-location-display">
            {locationLabel}
            <span className="location-time">{locationTime}</span>
          </div>
        </div>
      </div>

        {/* Map Guide Sidebar */}
        <div className="map-guide-sidebar">
          <h3 className="sidebar-title">Map Guide</h3>

          <label className="legend-item map-guide-toggle">
            <input
              type="checkbox"
              checked={showRiverLayer}
              onChange={(event) => setShowRiverLayer(event.target.checked)}
            />
            <div className="legend-line chenab-river"></div>
            <span>Chenab River</span>
          </label>

          <label className="legend-item map-guide-toggle">
            <input
              type="checkbox"
              checked={showUcBoundaries}
              onChange={(event) => setShowUcBoundaries(event.target.checked)}
            />
            <div className="legend-line uc-boundary"></div>
            <span>UC Boundaries</span>
          </label>

          <div className="risk-section">
            <p className="risk-indicator">% = Flood Risk</p>

            <h4 className="risk-title">Risk Levels</h4>

            <div className="risk-level-item">
              <div className="risk-dot critical"></div>
              <span className="risk-label">Critical</span>
              <span className="risk-range">&gt; 75%</span>
            </div>

            <div className="risk-level-item">
              <div className="risk-dot high"></div>
              <span className="risk-label">High</span>
              <span className="risk-range">50-75%</span>
            </div>

            <div className="risk-level-item">
              <div className="risk-dot moderate"></div>
              <span className="risk-label">Moderate</span>
              <span className="risk-range">25-50%</span>
            </div>

            <div className="risk-level-item">
              <div className="risk-dot low"></div>
              <span className="risk-label">Low</span>
              <span className="risk-range">&lt; 25%</span>
            </div>
          </div>
        </div>

      {/* Map Container */}
      <div className="map-container">
        {locationPrompt && (
          <div className="location-prompt-overlay">
            <div className="location-prompt-card">
              <div className="location-icon-wrap" aria-hidden="true">
                <FaMapMarkerAlt className="location-icon-react" />
              </div>
              <h2>Share Your Location</h2>
              <p>Allow access to your location to view flood risk information for your area</p>
              <div className="location-trust-note">
                <FaShieldAlt aria-hidden="true" />
                <span>Used only for local flood risk guidance</span>
              </div>
              <button className="allow-location-btn" onClick={handleAllowLocation}>
                Allow Location Access
              </button>
              <button className="deny-location-btn" onClick={() => setLocationPrompt(false)}>
                Not Now
              </button>
            </div>
          </div>
        )}
        
        {/* Search Bar */}
        <div className="search-container">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={`mic-icon ${isListening ? 'listening' : ''}`} onClick={handleVoiceSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
          </form>
        </div>

        <FloodMap
          searchQuery={searchQuery}
          userLocation={mapLocation}
          showRiverLayer={showRiverLayer}
          showUcBoundaries={showUcBoundaries}
          onUcSelect={handleUcSelect}
          onLiveUpdate={handleLiveUpdate}
        />

        {/* User Location Info Panel */}
        <div className="user-location-panel">
          <h3 className="panel-title">Your Union Council: {selectedUC.uc} — {selectedUC.district}</h3>
            
            <div className="risk-info-row">
              <div className="risk-time-label">24-Hour Flood Risk</div>
              <div className="risk-value">{selectedUC.risk24}%</div>
              <div className="risk-progress-bar">
                <div 
                  className="risk-progress-fill"
                  style={{
                    width: `${selectedUC.risk24}%`,
                    backgroundColor: getProgressColor(selectedUC.risk24)
                  }}
                ></div>
              </div>
            </div>
            
            <div className="risk-info-row">
              <div className="risk-time-label">48-Hour Flood Risk</div>
              <div className="risk-value">{selectedUC.risk48}%</div>
              <div className="risk-progress-bar">
                <div 
                  className="risk-progress-fill"
                  style={{
                    width: `${selectedUC.risk48}%`,
                    backgroundColor: getProgressColor(selectedUC.risk48)
                  }}
                ></div>
              </div>
            </div>
            
            <div className="risk-info-row">
              <div className="risk-time-label">72-Hour Flood Risk</div>
              <div className="risk-value">{selectedUC.risk72}%</div>
              <div className="risk-progress-bar">
                <div 
                  className="risk-progress-fill"
                  style={{
                    width: `${selectedUC.risk72}%`,
                    backgroundColor: getProgressColor(selectedUC.risk72)
                  }}
                ></div>
              </div>
            </div>

            <div className="live-status-text">{statusText}</div>
            
            <button 
              className="shelters-btn"
              type="button"
              onClick={handleViewShelters}
            >
              View Shelters List & Contacts
              <span className="arrow-icon">→</span>
            </button>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <UCFloodRiskPopup
          ucData={selectedUC}
          onClose={() => setShowPopup(false)}
          onViewShelters={handleViewShelters}
        />
      )}
    </div>
  );
};

export default FloodRiskPage;
