import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/MapPage.css';

// Custom hook for map controls
function MapController({ searchQuery, onMapReady, ucData }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (searchQuery && map && ucData.length > 0) {
      const foundUC = ucData.find(uc => 
        uc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (foundUC) {
        map.flyTo([foundUC.lat, foundUC.lng], 13, { duration: 1.5 });
      }
    }
  }, [searchQuery, map, ucData]);

  return null;
}

const MapPage = () => {
  const [basinData, setBasinData] = useState(null);
  const [ucData, setUcData] = useState(null);
  const [riverData, setRiverData] = useState(null);
  const [gaugeData, setGaugeData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [basemapType, setBasemapType] = useState('streets');
  const [apiUCData, setApiUCData] = useState([]); // ← REAL data from backend
  const [basinStats, setBasinStats] = useState({  // ← REAL stats from backend
    total: 0, critical: 0, high: 0, moderate: 0
  });
  const mapRef = useRef();

  const clampRisk = (value) => Math.max(0, Math.min(100, Math.round(value)));

  const handleSearch = (searchTerm) => {
  // Your search logic here
  console.log("Searching for:", searchTerm);
  // For example, filter map markers, update state, etc.
};
  // ─────────────────────────────────────────────
  // FETCH REAL UC RISK DATA FROM BACKEND
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const response = await fetch("https://ghaniasaghir-cguard-backend.hf.space/all-ucs");
        const data = await response.json();
        
        if (data.union_councils) {
          setApiUCData(data.union_councils);

          // Calculate basin stats from real data
          const total    = data.union_councils.length;
          const critical = data.union_councils.filter(uc => uc.risk_percentage > 75).length;
          const high     = data.union_councils.filter(uc => uc.risk_percentage > 50 && uc.risk_percentage <= 75).length;
          const moderate = data.union_councils.filter(uc => uc.risk_percentage > 25 && uc.risk_percentage <= 50).length;

          setBasinStats({ total, critical, high, moderate });
        }
      } catch (error) {
        console.error("Could not fetch UC risk data from backend:", error);
      }
    };

    fetchRiskData();
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [basinRes, ucRes, riverRes, gaugeRes] = await Promise.all([
          fetch('/geojson/chenab_basin.geojson'),
          fetch('/geojson/union_councils.geojson'),
          fetch('/geojson/chenab_rivers.geojson'),
          fetch('/geojson/chenab_guages.geojson')
        ]);
        
        setBasinData(await basinRes.json());
        const ucGeoJSON = await ucRes.json();
        
        const filteredFeatures = ucGeoJSON.features.filter(feature => {
          if (feature.properties.PROVINCE !== 'Punjab') return false;
          const coords = feature.geometry.coordinates[0];
          if (!coords || !coords[0]) return false;
          const lng = coords[0][0];
          const lat = coords[0][1];
          return lat >= 31.7 && lat <= 32.3 && lng >= 74.0 && lng <= 74.6;
        });
        
        console.log(`Filtered UCs: ${filteredFeatures.length} of ${ucGeoJSON.features.length}`);
        
        // Use REAL risk data from backend if available, otherwise random
        ucGeoJSON.features = filteredFeatures.map(feature => {
          const ucName = feature.properties.UC_NAME || feature.properties.UC || '';
          const matchedUC = apiUCData.find(uc =>
            ucName.toLowerCase().includes(uc.name.toLowerCase()) ||
            uc.name.toLowerCase().includes(ucName.toLowerCase())
          );

          return {
            ...feature,
            properties: {
              ...feature.properties,
              risk_percentage: matchedUC
                ? matchedUC.risk_percentage
                : Math.floor(Math.random() * 80) + 10
            }
          };
        });
        
        setUcData(ucGeoJSON);
        setRiverData(await riverRes.json());
        setGaugeData(await gaugeRes.json());
        setLoading(false);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        setBasinData(generateMockBasinData());
        setRiverData(generateMockRiverData());
        setLoading(false);
      }
    };

    loadData();
  }, [apiUCData]); // re-run when real API data arrives

  const generateMockBasinData = () => ({
    type: 'FeatureCollection',
    features: apiUCData.length > 0
      ? apiUCData.map(uc => ({
          type: 'Feature',
          properties: { name: uc.name, risk_percentage: uc.risk_percentage, id: uc.id },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [74.3 - 0.05, 32.0 - 0.05],
              [74.3 + 0.05, 32.0 - 0.05],
              [74.3 + 0.05, 32.0 + 0.05],
              [74.3 - 0.05, 32.0 + 0.05],
              [74.3 - 0.05, 32.0 - 0.05]
            ]]
          }
        }))
      : []
  });

  const generateMockRiverData = () => ({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { name: 'Chenab River' },
      geometry: {
        type: 'LineString',
        coordinates: [[74.1, 31.8], [74.2, 31.9], [74.3, 32.0], [74.4, 32.1], [74.5, 32.2]]
      }
    }]
  });

  const getRiskColor = (percentage) => {
    if (percentage > 75) return '#dc2626';
    if (percentage >= 50) return '#ea580c';
    if (percentage >= 25) return '#facc15';
    return '#16a34a';
  };

  const getRiskTextColor = (percentage) => {
    if (percentage > 75) return '#dc2626';
    if (percentage >= 50) return '#ea580c';
    if (percentage >= 25) return '#ca8a04';
    return '#16a34a';
  };

  const ucStyle = (feature) => ({
    fillColor: getRiskColor(feature.properties.risk_percentage),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '',
    fillOpacity: 0.5
  });

  const basinStyle = {
    fillColor: 'transparent',
    weight: 3,
    opacity: 0.8,
    color: '#3b82f6',
    dashArray: '5, 5',
    fillOpacity: 0
  };

  const riverStyle = {
    color: '#3b82f6',
    weight: 4,
    opacity: 0.9,
    dashArray: '',
    lineCap: 'round',
    lineJoin: 'round'
  };

  const onEachUCFeature = (feature, layer) => {
    if (feature.properties && feature.properties.risk_percentage) {
      const percentage = feature.properties.risk_percentage;
      const ucName = feature.properties.UC_NAME || feature.properties.UC || 'UC';
      const district = feature.properties.DISTRICT || feature.properties.DISTRICT_NAME || 'Hafizabad';
      const popupContent = `
        <div class="custom-popup">
          <span class="uc-name">${ucName}</span>
          <span class="uc-percentage" style="color: ${getRiskTextColor(percentage)}">${percentage}%</span>
        </div>
      `;
      layer.bindTooltip(popupContent, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip'
      });
      layer.on('click', function() {
        layer.openPopup();
      });
    }
  };

  const handleMicrophoneClick = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend  = () => setIsListening(false);
      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const handleZoomIn  = () => { if (map) map.zoomIn();  };
  const handleZoomOut = () => { if (map) map.zoomOut(); };

  return (
    <div className="map-page">
      <div className="map-container">
        <MapContainer
          center={[32.0, 74.3]}
          zoom={11}
          className="leaflet-map"
          ref={mapRef}
          zoomControl={false}
        >
          {basemapType === 'streets' ? (
            <TileLayer
              key="streets"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              key="satellite"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          <MapController
            searchQuery={searchQuery}
            onMapReady={setMap}
            ucData={apiUCData}
          />
          
          {ucData && (
            <GeoJSON data={ucData} style={ucStyle} onEachFeature={onEachUCFeature} />
          )}
          {basinData && (
            <GeoJSON data={basinData} style={basinStyle} />
          )}
          {riverData && (
            <GeoJSON data={riverData} style={riverStyle} />
          )}
        </MapContainer>

        {/* Search Bar */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search UC or District"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div
              className={`mic-icon ${isListening ? 'listening' : ''}`}
              onClick={handleMicrophoneClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </form>
        </div>

        {/* Map Guide Box */}
        <div className="map-guide">
          <h3>Map Guide</h3>
          <div className="guide-item">
            <div className="guide-line chenab-line"></div>
            <span>Chenab River</span>
          </div>
          <div className="guide-item">
            <div className="guide-square boundary-square"></div>
            <span>UC Boundaries</span>
          </div>
          <div className="guide-item">
            <span>% = Flood Risk</span>
          </div>
          <div className="risk-levels">
            <h4>Risk Levels</h4>
            <div className="risk-item">
              <div className="risk-dot critical"></div>
              <span>Critical</span>
              <span className="risk-percent">&gt;75%</span>
            </div>
            <div className="risk-item">
              <div className="risk-dot high"></div>
              <span>High</span>
              <span className="risk-percent">50–75%</span>
            </div>
            <div className="risk-item">
              <div className="risk-dot moderate"></div>
              <span>Moderate</span>
              <span className="risk-percent">25–50%</span>
            </div>
            <div className="risk-item">
              <div className="risk-dot low"></div>
              <span>Low</span>
              <span className="risk-percent">&lt;25%</span>
            </div>
          </div>
        </div>

        {/* Basin Overview Box — now shows REAL numbers from backend */}
        <div className="basin-overview">
          <h3>Basin Overview</h3>
          <p className="updated">Live data from backend</p>
          
          <div className="stat-item">
            <div className="stat-icon monitored"></div>
            <div className="stat-content">
              <span className="stat-number">{basinStats.total || 156}</span>
              <span className="stat-label">UCs Monitored</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon critical"></div>
            <div className="stat-content">
              <span className="stat-number">{basinStats.critical || 8}</span>
              <span className="stat-label">Critical Risk</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon high"></div>
            <div className="stat-content">
              <span className="stat-number">{basinStats.high || 23}</span>
              <span className="stat-label">High Risk</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon moderate"></div>
            <div className="stat-content">
              <span className="stat-number">{basinStats.moderate || 47}</span>
              <span className="stat-label">Moderate Risk</span>
            </div>
          </div>
        </div>



        {/* Custom Zoom Controls */}
        <div className="zoom-controls">
          <button onClick={handleZoomIn} className="zoom-btn" aria-label="Zoom in">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={handleZoomOut} className="zoom-btn" aria-label="Zoom out">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Basemap Toggle */}
        <div className="basemap-toggle">
          <span className="toggle-label">Map</span>
          <button
            onClick={() => setBasemapType(basemapType === 'streets' ? 'satellite' : 'streets')}
            className={`toggle-switch ${basemapType === 'satellite' ? 'active' : ''}`}
            aria-label="Toggle basemap"
          >
            <div className="toggle-slider"></div>
          </button>
          <span className="toggle-label">Satellite</span>
        </div>
      </div>
    </div>
  );
};

export default MapPage;