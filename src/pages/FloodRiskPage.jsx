import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/FloodRiskPage.css';

// Dummy data for union councils with flood risk
const dummyUCData = [
  { id: 1, name: 'UC Kot Khaira', risk: 27, lat: 32.15, lng: 74.25 },
  { id: 2, name: 'UC Annkar', risk: 35, lat: 32.12, lng: 74.45 },
  { id: 3, name: 'UC Hafizabad', risk: 32, lat: 32.05, lng: 74.35 },
  { id: 4, name: 'UC Kot Saleem', risk: 22, lat: 32.08, lng: 74.15 },
  { id: 5, name: 'UC Noor Pur', risk: 34, lat: 31.95, lng: 74.45 },
  { id: 6, name: 'UC Pindi Bhattian', risk: 75, lat: 31.85, lng: 74.30 }
];

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
  const [ucData, setUcData] = useState(null);
  const [riverData, setRiverData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPrompt, setLocationPrompt] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [map, setMap] = useState(null);

  // Load GeoJSON data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ucRes, riverRes] = await Promise.all([
          fetch('/geojson/union_councils.geojson'),
          fetch('/geojson/chenab_rivers.geojson')
        ]);
        
        const ucGeoJSON = await ucRes.json();
        
        // Filter UCs and add risk data
        const filteredFeatures = ucGeoJSON.features.filter(feature => {
          if (feature.properties.PROVINCE !== 'Punjab') return false;
          const coords = feature.geometry.coordinates[0];
          if (!coords || !coords[0]) return false;
          const lng = coords[0][0];
          const lat = coords[0][1];
          return lat >= 31.7 && lat <= 32.3 && lng >= 74.0 && lng <= 74.6;
        });
        
        ucGeoJSON.features = filteredFeatures.map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            risk_percentage: dummyUCData.find(uc => 
              feature.properties.UC_NAME?.includes(uc.name.replace('UC ', ''))
            )?.risk || Math.floor(Math.random() * 60) + 15
          }
        }));
        
        setUcData(ucGeoJSON);
        setRiverData(await riverRes.json());
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Handle location sharing
  const handleAllowLocation = () => {
    setLocationPrompt(false);
    // Simulate location detection with dummy data
    setTimeout(() => {
      setUserLocation(dummyUserLocation);
      if (map) {
        map.flyTo([dummyUserLocation.lat, dummyUserLocation.lng], 13, { duration: 1.5 });
      }
    }, 500);
  };

  // Risk level color mapping
  const getRiskColor = (percentage) => {
    if (percentage > 75) return '#dc2626';
    if (percentage >= 50) return '#ea580c';
    if (percentage >= 25) return '#facc15';
    return '#22c55e';
  };

  // Risk level text
  const getRiskLevel = (percentage) => {
    if (percentage > 75) return 'Critical';
    if (percentage >= 50) return 'High';
    if (percentage >= 25) return 'Moderate';
    return 'Low';
  };

  // Style for UC polygons
  const ucStyle = (feature) => {
    const risk = feature.properties.risk_percentage || 0;
    return {
      fillColor: getRiskColor(risk),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.6
    };
  };

  // Style for rivers
  const riverStyle = {
    color: '#3b82f6',
    weight: 3,
    opacity: 0.8
  };

  // Handle UC click
  const onEachUC = (feature, layer) => {
    const risk = feature.properties.risk_percentage || 0;
    const ucName = feature.properties.UC_NAME || feature.properties.UC || 'Unknown';
    
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          fillOpacity: 0.8
        });
      },
      mouseout: (e) => {
        e.target.setStyle({
          fillOpacity: 0.6
        });
      }
    });
    
    layer.bindTooltip(`${ucName}: ${risk}%`, {
      permanent: false,
      direction: 'center',
      className: 'uc-label'
    });
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

  return (
    <div className="flood-risk-page">
      {/* Header */}
      <div className="flood-risk-header">
        <div className="header-left">
          <h1 className="page-title">C Guard | Chenab Basin</h1>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={onBackToHome}>
            ← Back to Home
          </button>
          <div className="user-location-display">
            Your Location
            <span className="location-time">Jan 2 2026 14:00 PKT</span>
          </div>
        </div>
      </div>

      {/* Map Guide Sidebar */}
      <div className="map-guide-sidebar">
        <h3 className="sidebar-title">Map Guide</h3>
        
        <div className="legend-item">
          <div className="legend-line chenab-river"></div>
          <span>Chenab River</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-line uc-boundary"></div>
          <span>UC Boundaries</span>
        </div>
        
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
              <div className="location-icon">📍</div>
              <h2>Share Your Location</h2>
              <p>Allow access to your location to view flood risk information for your area</p>
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

        {/* Leaflet Map */}
        <MapContainer
          center={[32.0, 74.3]}
          zoom={11}
          className="leaflet-map"
          whenCreated={setMap}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri'
          />
          
          {ucData && (
            <GeoJSON 
              data={ucData} 
              style={ucStyle}
              onEachFeature={onEachUC}
            />
          )}
          
          {riverData && (
            <GeoJSON 
              data={riverData} 
              style={riverStyle}
            />
          )}
          
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: '<div class="user-marker-dot"></div>',
                iconSize: [20, 20]
              })}
            />
          )}
        </MapContainer>

        {/* User Location Info Panel */}
        {userLocation && (
          <div className="user-location-panel">
            <h3 className="panel-title">Your Union Council: {userLocation.uc} — {userLocation.district}</h3>
            
            <div className="risk-info-row">
              <div className="risk-time-label">24-Hour Flood Risk</div>
              <div className="risk-value">{userLocation.floodRisk.twentyFourHour}%</div>
              <div className="risk-progress-bar">
                <div 
                  className="risk-progress-fill"
                  style={{
                    width: `${userLocation.floodRisk.twentyFourHour}%`,
                    backgroundColor: getProgressColor(userLocation.floodRisk.twentyFourHour)
                  }}
                ></div>
              </div>
            </div>
            
            <div className="risk-info-row">
              <div className="risk-time-label">48-Hour Flood Risk</div>
              <div className="risk-value">{userLocation.floodRisk.fortyEightHour}%</div>
              <div className="risk-progress-bar">
                <div 
                  className="risk-progress-fill"
                  style={{
                    width: `${userLocation.floodRisk.fortyEightHour}%`,
                    backgroundColor: getProgressColor(userLocation.floodRisk.fortyEightHour)
                  }}
                ></div>
              </div>
            </div>
            
            <div className="risk-info-row">
              <div className="risk-time-label">72-Hour Flood Risk</div>
              <div className="risk-value">{userLocation.floodRisk.seventyTwoHour}%</div>
              <div className="risk-progress-bar">
                <div 
                  className="risk-progress-fill"
                  style={{
                    width: `${userLocation.floodRisk.seventyTwoHour}%`,
                    backgroundColor: getProgressColor(userLocation.floodRisk.seventyTwoHour)
                  }}
                ></div>
              </div>
            </div>
            
            <button 
              className="shelters-btn"
              onClick={() => onViewShelters && onViewShelters(userLocation)}
            >
              View Shelters List & Contacts
              <span className="arrow-icon">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloodRiskPage;
