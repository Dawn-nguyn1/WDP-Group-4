import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  FeatureGroup,
  Polygon,
} from "react-leaflet";
import { InputNumber, Select, TimePicker, Button, Space } from "antd";
import { DeleteOutlined, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import L from "leaflet";
import dayjs from "dayjs";
import { fetchZonesAPI } from "../../zones/services/zoneApi";
import { fetchFlightPlansAPI } from "../services/flightPlanApi";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const { Option } = Select;

const ClickHandler = ({ onMapClick }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
};

const ACTION_CONFIG = {
  TAKEOFF:  { color: "#22c55e", bg: "#f0fdf4", label: "TAKEOFF" },
  WAYPOINT: { color: "#2563eb", bg: "#eff6ff", label: "WAYPOINT" },
  HOVER:    { color: "#f59e0b", bg: "#fffbeb", label: "HOVER" },
  LAND:     { color: "#ef4444", bg: "#fef2f2", label: "LAND" },
};

const WaypointEditorWithZones = ({
  waypoints,
  setWaypoints,
  initialCenter = [10.8231, 106.6297],
}) => {
  const [mapZones, setMapZones] = useState([]);
  const [zoneFilter, setZoneFilter] = useState('all'); // Bộ lọc zone types
  const [hoveredZoneId, setHoveredZoneId] = useState(null);
  const [flightPlans, setFlightPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllPaths, setShowAllPaths] = useState(false);

  const fetchZones = async () => {
    try {
      const res = await fetchZonesAPI({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" });
      const apiZones = Array.isArray(res?.data) ? res.data : [];
      const leafletZones = apiZones.map((z) => {
        const ring = z?.geometry?.coordinates?.[0];
        if (!Array.isArray(ring)) return null;
        const coordinates = ring.map((pair) => {
          const lng = pair?.[0]; const lat = pair?.[1];
          if (typeof lat !== "number" || typeof lng !== "number") return null;
          return { lat, lng };
        }).filter(Boolean);
        if (coordinates.length < 3) return null;
        return { id: z._id, name: z.name, status: z.status, type: z.type, coordinates };
      }).filter(Boolean);
      setMapZones(leafletZones);
    } catch { setMapZones([]); }
  };

  const fetchFlightPlans = async () => {
    setLoading(true);
    try {
      const res = await fetchFlightPlansAPI({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" });
      setFlightPlans(Array.isArray(res?.data) ? res.data : []);
    } catch { setFlightPlans([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchZones(); fetchFlightPlans(); }, []);

  const handleMapClick = (latlng) => {
    const newWaypoint = {
      sequenceNumber: waypoints.length + 1,
      latitude: latlng.lat,
      longitude: latlng.lng,
      altitude: 50,
      speed: 10,
      estimatedTime: dayjs().add(waypoints.length * 10, "minutes").format("YYYY-MM-DDTHH:mm:ss"),
      action: waypoints.length === 0 ? "TAKEOFF" : (waypoints.length === 1 ? "LAND" : "WAYPOINT"),
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const updateWaypoint = (index, field, value) => {
    const updated = [...waypoints];
    updated[index] = { ...updated[index], [field]: value };
    setWaypoints(updated);
  };

  const removeWaypoint = (index) => {
    const reIndexed = waypoints.filter((_, i) => i !== index).map((wp, i) => ({ ...wp, sequenceNumber: i + 1 }));
    setWaypoints(reIndexed);
  };

  const positions = waypoints.map((wp) => [wp.latitude, wp.longitude]);
  const getZoneColor = (type) => type === "restricted" ? "#f59e0b" : "#ef4444";
  const selectedPlan = showAllPaths ? null : flightPlans.find(p => p._id === selectedPlanId);

  // Filter zones based on selected filter
  const getFilteredZones = () => {
    if (zoneFilter === 'all') return mapZones;
    if (zoneFilter === 'no_fly') return mapZones.filter(zone => zone.type === 'no_fly');
    if (zoneFilter === 'restricted') return mapZones.filter(zone => zone.type === 'restricted');
    return mapZones;
  };

  const filteredZones = getFilteredZones();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        .we-root {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Map toolbar ── */
        .we-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #fafafa;
          border-bottom: 1px solid #f0f1f3;
          gap: 12px;
          flex-wrap: wrap;
        }

        .we-stats {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .we-stat-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .we-stat-chip strong {
          color: #111827;
          font-weight: 700;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
        }

        .we-stat-dot { width: 6px; height: 6px; border-radius: 50%; }

        .we-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .we-select-sm {
          font-size: 12px;
        }

        /* ── Map container ── */
        .we-map-wrap {
          height: 520px;
          position: relative;
          z-index: 1;
        }

        .we-map-wrap .leaflet-container {
          z-index: 1;
        }

        .we-map-wrap .leaflet-control-container {
          z-index: 2;
        }

        .we-map-wrap .leaflet-pane {
          z-index: 1;
        }

        .we-map-wrap .leaflet-map-pane {
          z-index: 1;
        }

        .we-map-hint {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(17,24,39,0.75);
          backdrop-filter: blur(6px);
          color: white;
          font-size: 11.5px;
          padding: 6px 14px;
          border-radius: 20px;
          pointer-events: none;
          z-index: 999;
          letter-spacing: 0.3px;
        }

        /* ── Legend ── */
        .we-legend {
          padding: 12px 20px;
          border-top: 1px solid #f0f1f3;
          border-bottom: 1px solid #f0f1f3;
          background: #fafafa;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .we-legend-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #9ca3af;
          white-space: nowrap;
        }

        .we-legend-items {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .we-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #4b5563;
          font-weight: 500;
        }

        .we-legend-box {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .we-legend-line {
          width: 22px;
          height: 2px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        /* ── Waypoints list ── */
        .we-wp-list {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 380px;
          overflow-y: auto;
        }

        .we-wp-list::-webkit-scrollbar { width: 4px; }
        .we-wp-list::-webkit-scrollbar-track { background: transparent; }
        .we-wp-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        .we-wp-empty {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
        }
        .we-wp-empty-icon {
          font-size: 32px;
          margin-bottom: 10px;
          opacity: 0.4;
        }
        .we-wp-empty-text {
          font-size: 13px;
          font-weight: 500;
        }
        .we-wp-empty-sub {
          font-size: 12px;
          margin-top: 4px;
          opacity: 0.7;
        }

        /* ── Waypoint card ── */
        .we-wp-card {
          border: 1px solid #e8eaed;
          border-radius: 10px;
          background: #ffffff;
          overflow: hidden;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .we-wp-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.07); border-color: #d1d5db; }

        .we-wp-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid #f3f4f6;
        }

        .we-wp-card-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .we-wp-number {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Space Mono', monospace;
          flex-shrink: 0;
        }

        .we-wp-action-badge {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .we-wp-coords {
          font-size: 11.5px;
          color: #6b7280;
          font-family: 'Space Mono', monospace;
        }

        .we-wp-delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #d1d5db;
          padding: 4px 6px;
          border-radius: 6px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
        }
        .we-wp-delete-btn:hover { background: #fef2f2; color: #ef4444; }

        .we-wp-card-body {
          padding: 12px 14px;
          display: grid;
          grid-template-columns: 130px 100px 100px 1fr;
          gap: 12px;
          align-items: start;
        }

        .we-field-label {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .we-wp-card-body .ant-select-selector {
          border-radius: 6px !important;
          font-size: 12.5px !important;
          height: 32px !important;
        }

        .we-wp-card-body .ant-input-number {
          border-radius: 6px;
          font-size: 12.5px;
          width: 100%;
        }

        .we-wp-card-body .ant-input-number-input {
          height: 30px;
          font-size: 12.5px;
        }

        .we-wp-card-body .ant-picker {
          border-radius: 6px;
          height: 32px;
          font-size: 12.5px;
          width: 100%;
        }
      `}</style>

      <div className="we-root">
        {/* Toolbar */}
        <div className="we-toolbar">
          <div className="we-stats">
            <div className="we-stat-chip">
              <div className="we-stat-dot" style={{ background: "#2563eb" }} />
              Waypoints: <strong>{waypoints?.length || 0}</strong>
            </div>
            <div className="we-stat-chip">
              <div className="we-stat-dot" style={{ background: "#ef4444" }} />
              Vùng cấm: <strong>{mapZones.length}</strong>
            </div>
          </div>

          <div className="we-toolbar-controls">
            <Select
              placeholder={loading ? "Đang tải..." : "Xem kế hoạch khác"}
              style={{ width: 200, fontSize: 12 }}
              value={selectedPlanId}
              onChange={setSelectedPlanId}
              allowClear
              size="small"
              loading={loading}
              disabled={loading || showAllPaths}
            >
              {flightPlans.map((plan) => (
                <Option key={plan._id} value={plan._id}>
                  {plan.name || `Kế hoạch #${plan._id?.slice(-6)}`}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 130 }}
              value={showAllPaths ? "all" : "single"}
              onChange={(v) => setShowAllPaths(v === "all")}
              size="small"
            >
              <Option value="single">Một kế hoạch</Option>
              <Option value="all">Toàn bộ</Option>
            </Select>
          </div>
        </div>

        {/* Map */}
        <div className="we-map-wrap">
          {/* Zone Filter Controls - positioned inside map */}
          <div style={{
            position: "absolute",
            top: "5px",
            right: "20px",
            zIndex: 1000,
            background: "white",
            padding: "4px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            border: "1px solid #a89e9eff"
          }}>
            <Space direction="vertical" size={2}>
              <Button
                size="small"
                type={zoneFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setZoneFilter('all')}
                style={{ 
                  fontSize: "11px", 
                  height: "24px", 
                  minWidth: "70px",
                  margin: "1px",
                }}
              >
                Toàn bộ
              </Button>
              <Button
                size="small"
                type={zoneFilter === 'no_fly' ? 'primary' : 'default'}
                onClick={() => setZoneFilter('no_fly')}
                style={{ 
                  fontSize: "11px", 
                  height: "24px", 
                  minWidth: "70px",
                  margin: "1px",
                }}
              >
                Cấm bay
              </Button>
              <Button
                size="small"
                type={zoneFilter === 'restricted' ? 'primary' : 'default'}
                onClick={() => setZoneFilter('restricted')}
                style={{ 
                  fontSize: "11px", 
                  height: "24px", 
                  minWidth: "70px",
                  margin: "1px",
                }}
              >
                Hạn chế
              </Button>
            </Space>
          </div>

          <MapContainer
            center={initialCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onMapClick={handleMapClick} />

            <FeatureGroup>
              {filteredZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: hoveredZoneId === zone.id ? "#1d4ed8" : getZoneColor(zone.type),
                    fillColor: getZoneColor(zone.type),
                    fillOpacity: hoveredZoneId === zone.id ? 0.45 : 0.2,
                    weight: hoveredZoneId === zone.id ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    mouseover: () => setHoveredZoneId(zone.id),
                    mouseout: () => setHoveredZoneId(null),
                  }}
                />
              ))}
            </FeatureGroup>

            {waypoints.map((wp, index) => (
              <Marker 
                key={index} 
                position={[wp.latitude, wp.longitude]} 
                draggable={true}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="
                    background: ${wp.action === 'TAKEOFF' ? '#22c55e' : wp.action === 'LAND' ? '#ef4444' : wp.action === 'HOVER' ? '#f59e0b' : '#2563eb'};
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                    border: 2px solid white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                  ">${wp.sequenceNumber}</div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
                eventHandlers={{
                  dragend: (e) => {
                    const pos = e.target.getLatLng();
                    updateWaypoint(index, "latitude", pos.lat);
                    updateWaypoint(index, "longitude", pos.lng);
                  },
                }}
              >
                <Popup>
                  <strong>#{wp.sequenceNumber} {wp.action}</strong><br />
                  Alt: {wp.altitude}m · Speed: {wp.speed}m/s
                </Popup>
              </Marker>
            ))}

            {positions.length > 1 && (
              <Polyline positions={positions} color="#ef4444" weight={2.5} dashArray="6, 10" />
            )}

            {showAllPaths ? (
              flightPlans.map((plan) =>
                plan.waypoints?.length > 1 && (
                  <FeatureGroup key={plan._id}>
                    {plan.waypoints.map((wp, index) => (
                      <Marker
                        key={`${plan._id}-${index}`}
                        position={[wp.latitude, wp.longitude]}
                        icon={L.divIcon({
                          className: 'custom-div-icon',
                          html: `<div style="
                            background: ${plan.status === 'COMPLETED' ? '#22c55e' : '#2563eb'};
                            color: white;
                            border-radius: 50%;
                            width: 14px;
                            height: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 7px;
                            font-weight: bold;
                            border: 2px solid white;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                          ">${index + 1}</div>`,
                          iconSize: [14, 14],
                          iconAnchor: [7, 7]
                        })}
                      >
                        <Popup>
                          <div style={{ minWidth: 140, fontSize: '12px' }}>
                            <strong>{plan.name || `Kế hoạch #${plan._id?.slice(-6)}`}</strong>
                            <br />
                            <strong>WP #{wp.sequenceNumber}</strong> · {wp.action}
                            <br />
                            Alt: {wp.altitude}m · Speed: {wp.speed}m/s
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    <Polyline
                      positions={plan.waypoints.map(wp => [wp.latitude, wp.longitude])}
                      color={plan.status === "COMPLETED" ? "#22c55e" : "#2563eb"}
                      weight={2} opacity={0.65}
                    />
                  </FeatureGroup>
                )
              )
            ) : (
              selectedPlan?.waypoints?.length > 1 && (
                <FeatureGroup>
                  {selectedPlan.waypoints.map((wp, index) => (
                    <Marker
                      key={`selected-${index}`}
                      position={[wp.latitude, wp.longitude]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="
                          background: #2563eb;
                          color: white;
                          border-radius: 50%;
                          width: 14px;
                          height: 14px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 7px;
                          font-weight: bold;
                          border: 2px solid white;
                          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                        ">${index + 1}</div>`,
                        iconSize: [14, 14],
                        iconAnchor: [7, 7]
                      })}
                    >
                      <Popup>
                        <div style={{ minWidth: 140, fontSize: '12px' }}>
                          <strong>{selectedPlan.name || `Kế hoạch #${selectedPlan._id?.slice(-6)}`}</strong>
                          <br />
                          <strong>WP #{wp.sequenceNumber}</strong> · {wp.action}
                          <br />
                          Alt: {wp.altitude}m · Speed: {wp.speed}m/s
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Polyline
                    positions={selectedPlan.waypoints.map(wp => [wp.latitude, wp.longitude])}
                    color="#2563eb" weight={2} opacity={0.7} dashArray="6, 10"
                  />
                </FeatureGroup>
              )
            )}
          </MapContainer>

          {waypoints.length === 0 && (
            <div className="we-map-hint">
              Click vào bản đồ để thêm waypoint
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="we-legend">
          <span className="we-legend-title">Chú thích</span>
          <div className="we-legend-items">
            <div className="we-legend-item">
              <div className="we-legend-box" style={{ background: "#ef4444", opacity: 0.75 }} />
              Vùng cấm bay
            </div>
            <div className="we-legend-item">
              <div className="we-legend-box" style={{ background: "#f59e0b", opacity: 0.75 }} />
              Vùng hạn chế
            </div>
            <div className="we-legend-item">
              <div className="we-legend-line" style={{ background: "#ef4444" }} />
              Tuyến đang tạo
            </div>
            <div className="we-legend-item">
              <div className="we-legend-line" style={{ background: "#2563eb" }} />
              Tuyến có sẵn
            </div>
            <div className="we-legend-item">
              <div className="we-legend-line" style={{ background: "#22c55e" }} />
              Đã hoàn thành
            </div>
          </div>
        </div>

        {/* Waypoints list */}
        <div className="we-wp-list">
          {waypoints.length === 0 ? (
            <div className="we-wp-empty">
              <div className="we-wp-empty-icon">🗺️</div>
              <div className="we-wp-empty-text">Chưa có waypoint nào</div>
              <div className="we-wp-empty-sub">Click vào bản đồ để bắt đầu lập kế hoạch bay</div>
            </div>
          ) : (
            waypoints.map((wp, index) => {
              const cfg = ACTION_CONFIG[wp.action] || ACTION_CONFIG.WAYPOINT;
              return (
                <div className="we-wp-card" key={index}>
                  <div className="we-wp-card-header">
                    <div className="we-wp-card-left">
                      <div
                        className="we-wp-number"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {wp.sequenceNumber}
                      </div>
                      <span
                        className="we-wp-action-badge"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span className="we-wp-coords">
                        {wp.latitude.toFixed(5)}, {wp.longitude.toFixed(5)}
                      </span>
                    </div>
                    <button className="we-wp-delete-btn" onClick={() => removeWaypoint(index)}>
                      <DeleteOutlined style={{ fontSize: 13 }} />
                    </button>
                  </div>

                  <div className="we-wp-card-body">
                    <div>
                      <div className="we-field-label">Action</div>
                      <Select
                        value={wp.action}
                        style={{ width: "100%" }}
                        size="small"
                        onChange={(val) => updateWaypoint(index, "action", val)}
                      >
                        {Object.entries(ACTION_CONFIG).map(([key, c]) => (
                          <Option key={key} value={key}>{c.label}</Option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <div className="we-field-label">Altitude (m)</div>
                      <InputNumber
                        value={wp.altitude}
                        min={0}
                        size="small"
                        style={{ width: "100%" }}
                        onChange={(val) => updateWaypoint(index, "altitude", val)}
                      />
                    </div>
                    <div>
                      <div className="we-field-label">Speed (m/s)</div>
                      <InputNumber
                        value={wp.speed}
                        min={0}
                        size="small"
                        style={{ width: "100%" }}
                        onChange={(val) => updateWaypoint(index, "speed", val)}
                      />
                    </div>
                    <div>
                      <div className="we-field-label">Estimate Time</div>
                      <TimePicker
                        value={wp.estimatedTime ? dayjs(wp.estimatedTime) : null}
                        onChange={(time) =>
                          updateWaypoint(index, "estimatedTime", time ? time.format() : null)
                        }
                        format="HH:mm:ss"
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default WaypointEditorWithZones;