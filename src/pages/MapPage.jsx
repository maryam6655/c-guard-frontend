import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/MapPage.css';

// Mock API data - replace with real API calls later
const mockUCData = [
  { id: 1, name: 'UC Kot Khaira', riskPercentage: 27, lat: 32.15, lng: 74.25 },
  { id: 2, name: 'UC Annkar', riskPercentage: 35, lat: 32.12, lng: 74.45 },
  { id: 3, name: 'UC Hafizabad', riskPercentage: 32, lat: 32.05, lng: 74.35 },
  { id: 4, name: 'UC Kot Saleem', riskPercentage: 22, lat: 32.08, lng: 74.15 },
  { id: 5, name: 'UC Noor Pur', riskPercentage: 34, lat: 31.95, lng: 74.45 },
  { id: 6, name: 'UC Pindi Bhattian', riskPercentage: 75, lat: 31.85, lng: 74.30 }
];

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
      // Search for UC by name
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
  const [basemapType, setBasemapType] = useState('streets'); // 'streets' or 'satellite'
  const mapRef = useRef();

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
        
        // Filter to only Punjab UCs in the Chenab basin region (bounding box)
        // Roughly: lat 31.7-32.3, lng 74.0-74.6
        const filteredFeatures = ucGeoJSON.features.filter(feature => {
          if (feature.properties.PROVINCE !== 'Punjab') return false;
          
          // Get centroid or first coordinate to check bounds
          const coords = feature.geometry.coordinates[0];
          if (!coords || !coords[0]) return false;
          
          const lng = coords[0][0];
          const lat = coords[0][1];
          
          return lat >= 31.7 && lat <= 32.3 && lng >= 74.0 && lng <= 74.6;
        });
        
        console.log(`Filtered UCs: ${filteredFeatures.length} of ${ucGeoJSON.features.length}`);
        
        // Add mock risk percentages to filtered UC data
        ucGeoJSON.features = filteredFeatures.map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            risk_percentage: mockUCData.find(uc => 
              feature.properties.UC_NAME?.includes(uc.name.replace('UC ', '')) ||
              feature.properties.UC?.includes(uc.name.replace('UC ', ''))
            )?.riskPercentage || Math.floor(Math.random() * 80) + 10
          }
        }));
        
        setUcData(ucGeoJSON);
        setRiverData(await riverRes.json());
        setGaugeData(await gaugeRes.json());
        setLoading(false);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        // Fallback mock data for demo
        setBasinData(generateMockBasinData());
        setRiverData(generateMockRiverData());
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate mock basin data with risk data
  const generateMockBasinData = () => ({
    type: 'FeatureCollection',
    features: mockUCData.map(uc => ({
      type: 'Feature',
      properties: { 
        name: uc.name, 
        risk_percentage: uc.riskPercentage,
        id: uc.id
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [uc.lng - 0.05, uc.lat - 0.05],
          [uc.lng + 0.05, uc.lat - 0.05],
          [uc.lng + 0.05, uc.lat + 0.05],
          [uc.lng - 0.05, uc.lat + 0.05],
          [uc.lng - 0.05, uc.lat - 0.05]
        ]]
      }
    }))
  });

  // Generate mock river data
  const generateMockRiverData = () => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Chenab River' },
        geometry: {
          type: 'LineString',
          coordinates: [[74.1, 31.8], [74.2, 31.9], [74.3, 32.0], [74.4, 32.1], [74.5, 32.2]]
        }
      }
    ]
  });

  // Risk level color mapping
  const getRiskColor = (percentage) => {
    if (percentage > 75) return '#dc2626'; // Critical - Red
    if (percentage >= 50) return '#ea580c'; // High - Orange
    if (percentage >= 25) return '#facc15'; // Moderate - Yellow
    return '#16a34a'; // Low - Green
  };

  // Risk level text color for better contrast
  const getRiskTextColor = (percentage) => {
    if (percentage > 75) return '#dc2626';
    if (percentage >= 50) return '#ea580c';
    if (percentage >= 25) return '#ca8a04';
    return '#16a34a';
  };

  // UC boundary style function  
  const ucStyle = (feature) => ({
    fillColor: getRiskColor(feature.properties.risk_percentage),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '',
    fillOpacity: 0.5
  });

  // Basin style function (for chenab basin outline)
  const basinStyle = {
    fillColor: 'transparent',
    weight: 3,
    opacity: 0.8,
    color: '#3b82f6',
    dashArray: '5, 5',
    fillOpacity: 0
  };

  // River style with glow effect
  const riverStyle = {
    color: '#3b82f6',
    weight: 4,
    opacity: 0.9,
    dashArray: '',
    lineCap: 'round',
    lineJoin: 'round'
  };

  // Custom popup content for UC labels
  const onEachUCFeature = (feature, layer) => {
    if (feature.properties && feature.properties.risk_percentage) {
      const percentage = feature.properties.risk_percentage;
      const ucName = feature.properties.UC_NAME || feature.properties.UC || 'UC';
      const popupContent = `
        <div class="custom-popup">
          <span class="uc-name">${ucName}</span>
          <span class="uc-percentage" style="color: ${getRiskTextColor(percentage)}">${percentage}%</span>
        </div>
      `;
      
      // Create tooltip that shows on hover
      layer.bindTooltip(popupContent, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip'
      });
      
      // Add click event for more info
      layer.on('click', function() {
        layer.openPopup();
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search logic handled by MapController
      console.log('Searching for:', searchQuery);
    }
  };

  const handleMicrophoneClick = () => {
    // Check if speech recognition is supported
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
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      // Fallback for browsers without speech recognition
      alert('Speech recognition not supported in this browser');
    }
  };

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

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
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          <MapController 
            searchQuery={searchQuery} 
            onMapReady={setMap}
            ucData={mockUCData}
          />
          
          {/* Union Council boundaries with risk coloring */}
          {ucData && (
            <GeoJSON
              data={ucData}
              style={ucStyle}
              onEachFeature={onEachUCFeature}
            />
          )}
          
          {/* Basin outline */}
          {basinData && (
            <GeoJSON
              data={basinData}
              style={basinStyle}
            />
          )}
          
          {/* Chenab River with glow effect */}
          {riverData && (
            <GeoJSON
              data={riverData}
              style={riverStyle}
            />
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

        {/* Basin Overview Box */}
        <div className="basin-overview">
          <h3>Basin Overview</h3>
          <p className="updated">Updated 3 min ago</p>
          
          <div className="stat-item">
            <div className="stat-icon monitored"></div>
            <div className="stat-content">
              <span className="stat-number">156</span>
              <span className="stat-label">UCs Monitored</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon critical"></div>
            <div className="stat-content">
              <span className="stat-number">8</span>
              <span className="stat-label">Critical Risk</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon high"></div>
            <div className="stat-content">
              <span className="stat-number">23</span>
              <span className="stat-label">High Risk</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon moderate"></div>
            <div className="stat-content">
              <span className="stat-number">47</span>
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
