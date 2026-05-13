import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const DISTRICT_TO_STATION = {
  hafizabad: 'Marala',
  gujrat: 'Marala',
  sialkot: 'Marala',
  chiniot: 'Khanki',
  'mandi bahauddin': 'Khanki',
  'toba tek singh': 'Qadirabad',
  jhang: 'Trimmu',
  muzaffargarh: 'Trimmu',
  bahawalpur: 'Trimmu',
}

const BASIN_CENTER = [31.9, 73.9]
const BASIN_ZOOM = 8
const CHENAB_BASIN_BOUNDS = [
  [29.0, 70.0],
  [33.0, 75.0],
]
const GEOJSON_PATHS = ['/data/chenab_ucs.geojson']
const RIVER_PATH = '/geojson/chenab_rivers.geojson'

const formatNumber = (value, digits = 0) => {
  if (value == null || Number.isNaN(Number(value))) return 'N/A'
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value))
}

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

const stationForDistrict = (district = '') => {
  const key = normalizeText(district)
  return DISTRICT_TO_STATION[key] ?? null
}

const dischargeToColor = (discharge) => {
  if (discharge == null || Number.isNaN(Number(discharge))) return '#94a3b8'
  if (discharge > 50000) return '#FF0000'
  if (discharge >= 30000) return '#FF6600'
  if (discharge >= 15000) return '#FFCC00'
  return '#00CC00'
}

const riskFromDischarge = (discharge) => {
  if (discharge == null || Number.isNaN(Number(discharge))) return null
  return Math.min(100, Math.round((Number(discharge) / 50000) * 100))
}

const calculateRiskProgression = (baseRisk) => {
  if (baseRisk == null) return { risk24h: null, risk48h: null, risk72h: null }
  return {
    risk24h: baseRisk,
    risk48h: Math.min(100, Math.round(baseRisk * 1.15)),
    risk72h: Math.max(10, Math.round(baseRisk * 0.8)),
  }
}

const parseLiveStations = (payload) => {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.features)
      ? payload.features
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.results)
          ? payload.results
          : [payload]

  return rows
    .map((item) => {
      const source = item?.properties ?? item ?? {}
      const station =
        source.station ??
        source.station_name ??
        source.name ??
        source['station name'] ??
        source['station_name'] ??
        ''
      const discharge = Number(
        source.discharge ?? source.discharge_m3s ?? source.discharge_cms ?? source.flow ?? source.value
      )

      return {
        station: String(station).trim(),
        discharge: Number.isFinite(discharge) ? discharge : null,
        temperature: source.temperature ?? source.temp ?? null,
        rainfall: source.rainfall ?? source.rain ?? null,
      }
    })
    .filter((row) => row.station)
}

const stationMatch = (stationName, liveStations) => {
  const target = normalizeText(stationName)
  return (
    liveStations.find((row) => {
      const candidate = normalizeText(row.station)
      return candidate === target || candidate.includes(target) || target.includes(candidate)
    }) ?? null
  )
}

function UcDetailBox({ uc, riskProgression, isLoading, hasError }) {
  const riskColor24 = uc.riskPercentage > 60 ? '#FF0000' : uc.riskPercentage > 40 ? '#FF6600' : '#FFCC00'
  const riskColor48 = riskProgression.risk48h > 60 ? '#FF0000' : riskProgression.risk48h > 40 ? '#FF6600' : '#FFCC00'
  const riskColor72 = riskProgression.risk72h > 60 ? '#FF0000' : riskProgression.risk72h > 40 ? '#FF6600' : '#FFCC00'

  return (
    <div style={styles.detailBox}>
      <div style={styles.detailHeader}>
        <div style={styles.detailTitle}>Your Union Council: {uc.ucName} — {uc.district}</div>
      </div>

      <div style={styles.detailContent}>
        <div style={styles.riskRow}>
          <div style={styles.riskLabel}>24-Hour Flood Risk</div>
          <div style={styles.riskMeter}>
            <div
              style={{
                ...styles.riskBarBackground,
                width: '100%',
              }}
            >
              <div
                style={{
                  ...styles.riskBarFill,
                  width: `${uc.riskPercentage ?? 0}%`,
                  backgroundColor: riskColor24,
                }}
              />
            </div>
          </div>
          <div style={{ ...styles.riskValue, color: riskColor24 }}>
            {uc.riskPercentage ?? 'N/A'}%
          </div>
        </div>

        <div style={styles.riskRow}>
          <div style={styles.riskLabel}>48-Hour Flood Risk</div>
          <div style={styles.riskMeter}>
            <div
              style={{
                ...styles.riskBarBackground,
                width: '100%',
              }}
            >
              <div
                style={{
                  ...styles.riskBarFill,
                  width: `${riskProgression.risk48h ?? 0}%`,
                  backgroundColor: riskColor48,
                }}
              />
            </div>
          </div>
          <div style={{ ...styles.riskValue, color: riskColor48 }}>
            {riskProgression.risk48h ?? 'N/A'}%
          </div>
        </div>

        <div style={styles.riskRow}>
          <div style={styles.riskLabel}>72-Hour Flood Risk</div>
          <div style={styles.riskMeter}>
            <div
              style={{
                ...styles.riskBarBackground,
                width: '100%',
              }}
            >
              <div
                style={{
                  ...styles.riskBarFill,
                  width: `${riskProgression.risk72h ?? 0}%`,
                  backgroundColor: riskColor72,
                }}
              />
            </div>
          </div>
          <div style={{ ...styles.riskValue, color: riskColor72 }}>
            {riskProgression.risk72h ?? 'N/A'}%
          </div>
        </div>

        {(isLoading || hasError) && (
          <div style={styles.detailStatusText}>
            {hasError ? 'Waiting for live data' : 'Updating data...'}
          </div>
        )}

        <button style={styles.viewButton}>
          View Shelters List &amp; Contacts →
        </button>
      </div>
    </div>
  )
}

const buildEnrichedGeoJson = (geojson, liveStations) => {
  if (!geojson?.features) return null

  return {
    ...geojson,
    features: geojson.features.map((feature) => {
      const properties = feature?.properties ?? {}
      const ucName = String(properties.UC_NAME ?? properties.uc_name ?? properties.UC ?? properties.name ?? 'Unnamed UC').trim()
      const district = String(properties.DISTRICT ?? properties.district ?? '').trim()
      const station = stationForDistrict(district)
      const live = station ? stationMatch(station, liveStations) : null
      const discharge = live?.discharge ?? null

      return {
        ...feature,
        properties: {
          ...properties,
          UC_NAME: ucName,
          DISTRICT: district,
          station: station ?? 'Unmapped',
          discharge,
          temperature: live?.temperature ?? null,
          rainfall: live?.rainfall ?? null,
          risk_percentage: riskFromDischarge(discharge),
        },
      }
    }),
  }
}

function MapEffects({ geoJsonData, matchedFeature, userLocation, searchQuery, resetViewTick }) {
  const map = useMap()

  useEffect(() => {
    if (!geoJsonData?.features?.length) return
    if (searchQuery || userLocation || matchedFeature) return

    const bounds = L.geoJSON(geoJsonData).getBounds()
    if (bounds.isValid()) {
      const basinBounds = L.latLngBounds(CHENAB_BASIN_BOUNDS)
      const fitBounds = basinBounds.isValid() ? basinBounds : bounds
      map.fitBounds(fitBounds, { padding: [50, 50], maxZoom: 9 })
    }
  }, [geoJsonData, map, matchedFeature, searchQuery, userLocation])

  useEffect(() => {
    if (!resetViewTick) return

    const basinBounds = L.latLngBounds(CHENAB_BASIN_BOUNDS)
    if (basinBounds.isValid()) {
      map.fitBounds(basinBounds, { padding: [50, 50], maxZoom: 9 })
    }
  }, [map, resetViewTick])

  useEffect(() => {
    if (!matchedFeature) return

    const bounds = L.geoJSON(matchedFeature).getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 })
    }
  }, [map, matchedFeature])

  useEffect(() => {
    if (!userLocation) return
    map.flyTo(userLocation, Math.max(map.getZoom(), 12), { duration: 1.2 })
  }, [map, userLocation])

  return null
}

export default function FloodMap({
  searchQuery = '',
  userLocation = null,
  showUcBoundaries = true,
  showRiverLayer = true,
  onUcSelect,
  onLiveUpdate,
}) {
  const [geoJson, setGeoJson] = useState(null)
  const [riverGeoJson, setRiverGeoJson] = useState(null)
  const [liveStations, setLiveStations] = useState([])
  const [loadingGeoJson, setLoadingGeoJson] = useState(true)
  const [loadingLive, setLoadingLive] = useState(true)
  const [geoJsonError, setGeoJsonError] = useState('')
  const [liveError, setLiveError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [resetViewTick, setResetViewTick] = useState(0)
  const [selectedUc, setSelectedUc] = useState(null)

  const loadGeoJson = useCallback(async () => {
    setLoadingGeoJson(true)
    setGeoJsonError('')

    try {
      let response = null
      for (const path of GEOJSON_PATHS) {
        response = await fetch(path)
        if (response.ok) break
      }

      if (!response || !response.ok) {
        throw new Error('Unable to load Chenab UC boundaries.')
      }

      setGeoJson(await response.json())

      try {
        const riverResponse = await fetch(RIVER_PATH)
        if (riverResponse.ok) {
          setRiverGeoJson(await riverResponse.json())
        } else {
          setRiverGeoJson(null)
        }
      } catch {
        setRiverGeoJson(null)
      }
    } catch (error) {
      console.error('GeoJSON load error:', error)
      setGeoJson(null)
      setRiverGeoJson(null)
      setGeoJsonError('Unable to load Chenab UC boundaries.')
    } finally {
      setLoadingGeoJson(false)
    }
  }, [])

  const loadLiveData = useCallback(async () => {
    setLoadingLive(true)
    try {
      const response = await fetch('http://localhost:8000/features/live')
      if (!response.ok) {
        throw new Error(`Live data request failed: ${response.status}`)
      }

      const payload = await response.json()
      setLiveStations(parseLiveStations(payload))
      setLiveError('')
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Live data load error:', error)
      setLiveStations([])
      setLiveError('Live flood data is currently unavailable.')
    } finally {
      setLoadingLive(false)
    }
  }, [])

  useEffect(() => {
    loadGeoJson()
    loadLiveData()

    const intervalId = window.setInterval(() => {
      loadLiveData()
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [loadGeoJson, loadLiveData])

  useEffect(() => {
    if (!onLiveUpdate) return

    onLiveUpdate({
      lastUpdated,
      liveError,
      liveStations,
      loadingLive,
    })
  }, [lastUpdated, liveError, liveStations, loadingLive, onLiveUpdate])

  const enrichedGeoJson = useMemo(() => buildEnrichedGeoJson(geoJson, liveStations), [geoJson, liveStations])

  const matchedFeature = useMemo(() => {
    if (!searchQuery.trim() || !enrichedGeoJson?.features?.length) return null

    const query = normalizeText(searchQuery)
    return (
      enrichedGeoJson.features.find((feature) => {
        const properties = feature?.properties ?? {}
        const ucName = normalizeText(properties.UC_NAME ?? properties.uc_name ?? properties.UC ?? properties.name)
        return ucName.includes(query)
      }) ?? null
    )
  }, [enrichedGeoJson, searchQuery])

  const ucStyle = useCallback(
    (feature) => {
      const isMatch = matchedFeature && feature === matchedFeature
      return {
        fillColor: dischargeToColor(feature?.properties?.discharge),
        weight: isMatch ? 2.5 : 1.5,
        opacity: 1,
        color: isMatch ? '#111827' : '#333333',
        fillOpacity: isMatch ? 0.72 : 0.6,
        lineJoin: 'round',
        smoothFactor: 0,
      }
    },
    [matchedFeature]
  )

  const onEachFeature = useCallback(
    (feature, layer) => {
      const properties = feature?.properties ?? {}
      const ucName = properties.UC_NAME ?? properties.uc_name ?? properties.UC ?? properties.name ?? 'Unnamed UC'
      const district = properties.DISTRICT ?? properties.district ?? 'Unknown'
      const station = properties.station ?? 'Unmapped'
      const discharge = properties.discharge
      const riskPercentage = properties.risk_percentage

      const popupHtml = `
        <div style="min-width:220px;font-family:inherit">
          <div style="font-weight:700;font-size:16px;margin-bottom:8px;color:#0f172a">${ucName}</div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>District</span><strong>${district}</strong></div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>Station</span><strong>${station}</strong></div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>Discharge</span><strong>${formatNumber(discharge)} m³/s</strong></div>
          <div style="display:flex;justify-content:space-between;gap:12px;padding:2px 0;color:#334155"><span>Risk</span><strong>${riskPercentage == null ? 'N/A' : `${riskPercentage}%`}</strong></div>
        </div>
      `

      layer.bindPopup(popupHtml, {
        closeButton: true,
        maxWidth: 320,
        className: 'flood-map-popup',
      })

      layer.on('click', () => {
        setSelectedUc({
          ucName,
          district,
          station,
          discharge,
          riskPercentage,
        })
        if (!onUcSelect) return
        onUcSelect({
          ucName,
          district,
          station,
          discharge,
          riskPercentage,
        })
      })

      layer.on({
        mouseover: (event) => {
          event.target.setStyle({
            weight: 2,
            fillOpacity: 0.7,
          })
        },
        mouseout: (event) => {
          event.target.setStyle({
            weight: matchedFeature && event.target.feature === matchedFeature ? 2.5 : 1.5,
            fillOpacity: matchedFeature && event.target.feature === matchedFeature ? 0.72 : 0.6,
          })
        },
      })
    },
    [matchedFeature, onUcSelect]
  )

  const riverStyle = useMemo(
    () => ({
      color: '#3b82f6',
      weight: 3,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }),
    []
  )

  const showLoading = loadingGeoJson || loadingLive || !enrichedGeoJson
  const userLocationIcon = useMemo(() => {
    if (!userLocation) return null

    return L.divIcon({
      className: 'flood-map-user-location-icon',
      html: '<div style="width:14px;height:14px;border-radius:999px;background:#2563eb;border:2px solid #ffffff;box-shadow:0 0 0 6px rgba(37, 99, 235, 0.18);"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })
  }, [userLocation])

  const handleResetView = useCallback(() => {
    setResetViewTick((value) => value + 1)
  }, [])

  return (
    <div style={styles.root}>
      <div style={styles.mapFrame}>
        <button type="button" onClick={handleResetView} style={styles.resetButton}>
          Reset View
        </button>

        <MapContainer center={BASIN_CENTER} zoom={BASIN_ZOOM} style={styles.map} zoomControl={false} preferCanvas>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEffects
            geoJsonData={enrichedGeoJson}
            matchedFeature={matchedFeature}
            userLocation={userLocation}
            searchQuery={searchQuery}
            resetViewTick={resetViewTick}
          />

          {showUcBoundaries && enrichedGeoJson && <GeoJSON data={enrichedGeoJson} style={ucStyle} onEachFeature={onEachFeature} />}

          {showRiverLayer && riverGeoJson && <GeoJSON data={riverGeoJson} style={riverStyle} />}

          {userLocation && userLocationIcon && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
        </MapContainer>

        {showLoading && (
          <div style={styles.overlay}>
            <div style={styles.loadingCard}>
              <div style={styles.spinner} aria-hidden="true" />
              <div style={styles.loadingTitle}>Preparing flood map</div>
              <div style={styles.loadingText}>
                {loadingGeoJson ? 'Loading Chenab UC boundaries.' : 'Refreshing live flood data.'}
              </div>
            </div>
          </div>
        )}

        {(geoJsonError || liveError) && (
          <div style={styles.errorStack}>
            {geoJsonError && <div style={{ ...styles.errorCard, ...styles.errorDanger }}>{geoJsonError}</div>}
            {liveError && <div style={{ ...styles.errorCard, ...styles.errorWarning }}>{liveError}</div>}
          </div>
        )}

        {selectedUc && (
          <UcDetailBox 
            uc={selectedUc} 
            riskProgression={calculateRiskProgression(selectedUc.riskPercentage)}
            isLoading={loadingLive}
            hasError={!!liveError}
          />
        )}
      </div>

      <style>{`@keyframes flood-map-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 'calc(100vh - 70px)',
    background: 'linear-gradient(180deg, #0a1220 0%, #0f1b2f 100%)',
  },
  mapFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  resetButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 560,
    border: '1px solid rgba(23, 59, 95, 0.2)',
    borderRadius: 999,
    padding: '0.65rem 1rem',
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#173B5F',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.22), rgba(3, 7, 18, 0.12))',
    zIndex: 520,
    pointerEvents: 'none',
  },
  loadingCard: {
    width: 'min(92vw, 380px)',
    borderRadius: 20,
    padding: '1.15rem 1.3rem',
    textAlign: 'center',
    color: '#e2e8f0',
    background: 'rgba(15, 23, 42, 0.72)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 24px 60px rgba(2, 6, 23, 0.28)',
  },
  spinner: {
    width: 36,
    height: 36,
    margin: '0 auto',
    borderRadius: '50%',
    border: '3px solid rgba(148, 163, 184, 0.28)',
    borderTopColor: '#60a5fa',
    animation: 'flood-map-spin 900ms linear infinite',
  },
  loadingTitle: {
    margin: '0.85rem 0 0.4rem',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#f8fafc',
  },
  loadingText: {
    margin: 0,
    color: 'rgba(226, 232, 240, 0.8)',
    fontSize: '0.92rem',
  },
  errorStack: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 540,
    display: 'grid',
    gap: 10,
    width: 'min(92vw, 420px)',
    pointerEvents: 'none',
  },
  errorCard: {
    borderRadius: 14,
    padding: '0.85rem 1rem',
    fontWeight: 600,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
  },
  errorDanger: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fee2e2',
    border: '1px solid rgba(248, 113, 113, 0.16)',
  },
  errorWarning: {
    background: 'rgba(245, 158, 11, 0.12)',
    color: '#ffedd5',
    border: '1px solid rgba(251, 191, 36, 0.16)',
  },
  detailBox: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 'min(92vw, 380px)',
    borderRadius: 16,
    background: '#ffffff',
    boxShadow: '0 20px 48px rgba(15, 23, 42, 0.24)',
    zIndex: 550,
    overflow: 'hidden',
  },
  detailHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  detailTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
  },
  detailContent: {
    padding: '20px',
    display: 'grid',
    gap: '16px',
  },
  riskRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 60px',
    alignItems: 'center',
    gap: '12px',
  },
  riskLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
  },
  riskMeter: {
    width: '100%',
    height: '8px',
    borderRadius: 4,
  },
  riskBarBackground: {
    height: '8px',
    borderRadius: 4,
    background: '#e2e8f0',
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 300ms ease-out',
  },
  riskValue: {
    fontSize: '14px',
    fontWeight: 700,
    textAlign: 'right',
  },
  detailStatusText: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center',
    margin: '4px 0',
  },
  viewButton: {
    width: '100%',
    padding: '12px 16px',
    marginTop: '8px',
    borderRadius: 8,
    border: 'none',
    background: '#1e3a8a',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 200ms',
  },
}