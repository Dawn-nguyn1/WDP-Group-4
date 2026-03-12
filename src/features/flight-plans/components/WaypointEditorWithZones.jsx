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
import {
  Button,
  InputNumber,
  Select,
  Space,
  Card,
  Typography,
  TimePicker,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import L from "leaflet";
import dayjs from "dayjs";
import { fetchZonesAPI } from "../../zones/services/zoneApi";

// Fix Leaflet's default icon issue in React
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
const { Text } = Typography;

const ClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const WaypointEditorWithZones = ({
  waypoints,
  setWaypoints,
  initialCenter = [10.8231, 106.6297],
}) => {
  const [mapZones, setMapZones] = useState([]);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);

  // Load zones from API
  const fetchZones = async () => {
    try {
      const res = await fetchZonesAPI({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const apiZones = Array.isArray(res?.data) ? res.data : [];
      const leafletZones = apiZones
        .map((z) => {
          const ring = z?.geometry?.coordinates?.[0];
          if (!Array.isArray(ring)) return null;

          const coordinates = ring
            .map((pair) => {
              const lng = pair?.[0];
              const lat = pair?.[1];
              if (typeof lat !== "number" || typeof lng !== "number")
                return null;
              return { lat, lng };
            })
            .filter(Boolean);

          if (coordinates.length < 3) return null;

          return {
            id: z._id,
            name: z.name,
            description: z.description,
            status: z.status,
            type: z.type,
            coordinates,
            altitude_min: z.minAltitude,
            altitude_max: z.maxAltitude,
            createdAt: z.createdAt,
            updatedAt: z.updatedAt,
          };
        })
        .filter(Boolean);

      setMapZones(leafletZones);
    } catch (error) {
      console.log("Fetch zones error:", error);
      setMapZones([]);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleMapClick = (latlng) => {
    const newWaypoint = {
      sequenceNumber: waypoints.length + 1,
      latitude: latlng.lat,
      longitude: latlng.lng,
      altitude: 50, // Default
      speed: 10,
      estimatedTime: dayjs()
        .add(waypoints.length * 10, "minutes")
        .format("YYYY-MM-DDTHH:mm:ss"),
      action: waypoints.length === 0 ? "TAKEOFF" : "WAYPOINT",
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const updateWaypoint = (index, field, value) => {
    const updated = [...waypoints];
    updated[index] = { ...updated[index], [field]: value };
    setWaypoints(updated);
  };

  const removeWaypoint = (index) => {
    const updated = waypoints.filter((_, i) => i !== index);
    // Re-index
    const reIndexed = updated.map((wp, i) => ({
      ...wp,
      sequenceNumber: i + 1,
    }));
    setWaypoints(reIndexed);
  };

  const positions = waypoints.map((wp) => [wp.latitude, wp.longitude]);

  // Get zone color based on type
  const getZoneColor = (type) => {
    if (type === "restricted") {
      return "#ffd700"; // Màu vàng cho restricted zone
    }
    return "#ff0000"; // Màu đỏ cho no_fly zone
  };

  return (
    <div>
      <div
        style={{
          height: "400px",
          marginBottom: "16px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
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
          
          {/* Render no-fly zones */}
          <FeatureGroup>
            {mapZones.map((zone) => {
              const zoneColor = getZoneColor(zone.type);
              const isHovered = hoveredZoneId === zone.id;

              return (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: isHovered ? "#1890ff" : zoneColor,
                    fillColor: zoneColor,
                    fillOpacity: isHovered ? 0.5 : 0.3,
                    weight: isHovered ? 4 : 2,
                  }}
                  eventHandlers={{
                    mouseover: () => {
                      setHoveredZoneId(zone.id);
                    },
                    mouseout: () => {
                      setHoveredZoneId(null);
                    },
                  }}
                />
              );
            })}
          </FeatureGroup>

          {/* Render waypoints */}
          {waypoints.map((wp, index) => (
            <Marker
              key={index}
              position={[wp.latitude, wp.longitude]}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  updateWaypoint(index, "latitude", position.lat);
                  updateWaypoint(index, "longitude", position.lng);
                },
              }}
            >
              <Popup>
                <strong>Waypoint {wp.sequenceNumber}</strong> <br />
                {wp.action} - Alt: {wp.altitude}m
              </Popup>
            </Marker>
          ))}
          
          {/* Render flight path */}
          {positions.length > 1 && (
            <Polyline positions={positions} color="blue" weight={3} />
          )}
        </MapContainer>
      </div>

      {/* Zone info */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          Vùng cấm bay ({mapZones.length})
        </Text>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: "#ff0000",
                border: "1px solid #ccc",
              }}
            />
            <Text style={{ fontSize: 12 }}>Vùng cấm bay</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: "#ffd700",
                border: "1px solid #ccc",
              }}
            />
            <Text style={{ fontSize: 12 }}>Vùng hạn chế</Text>
          </div>
        </div>
      </Card>

      {/* Waypoints list */}
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {waypoints.map((wp, index) => (
          <Card key={index} size="small" style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <Text strong>
                  #{wp.sequenceNumber} ({wp.latitude.toFixed(4)},{" "}
                  {wp.longitude.toFixed(4)})
                </Text>
              </div>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeWaypoint(index)}
              />
            </div>

            <Space style={{ marginTop: 8, display: "flex", flexWrap: "wrap" }}>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: "12px", display: "block" }}
                >
                  Action
                </Text>
                <Select
                  value={wp.action}
                  style={{ width: 120 }}
                  onChange={(val) => updateWaypoint(index, "action", val)}
                >
                  <Option value="TAKEOFF">TAKEOFF</Option>
                  <Option value="WAYPOINT">WAYPOINT</Option>
                  <Option value="HOVER">HOVER</Option>
                  <Option value="LAND">LAND</Option>
                </Select>
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: "12px", display: "block" }}
                >
                  Altitude (m)
                </Text>
                <InputNumber
                  value={wp.altitude}
                  min={0}
                  onChange={(val) => updateWaypoint(index, "altitude", val)}
                />
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: "12px", display: "block" }}
                >
                  Speed (m/s)
                </Text>
                <InputNumber
                  value={wp.speed}
                  min={0}
                  onChange={(val) => updateWaypoint(index, "speed", val)}
                />
              </div>

              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: "12px", display: "block" }}
                >
                  Est. Time
                </Text>
                <TimePicker
                  value={wp.estimatedTime ? dayjs(wp.estimatedTime) : null}
                  onChange={(time) =>
                    updateWaypoint(
                      index,
                      "estimatedTime",
                      time ? time.format() : null,
                    )
                  }
                  format="HH:mm:ss"
                />
              </div>
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WaypointEditorWithZones;
