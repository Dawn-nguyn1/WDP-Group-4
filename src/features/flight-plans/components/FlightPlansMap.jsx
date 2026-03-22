import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  FeatureGroup,
  Polygon,
} from "react-leaflet";
import { Card, Select, Button, Space, Typography, Spin, Tag } from "antd";
import { fetchZonesAPI } from "../../zones/services/zoneApi";
import { fetchFlightPlansAPI } from "../services/flightPlanApi";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import dayjs from "dayjs";

// Fix Leaflet's default icon issue in React
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const { Option } = Select;
const { Text, Title } = Typography;

const FlightPlansMap = () => {
  const [mapZones, setMapZones] = useState([]);
  const [flightPlans, setFlightPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllPaths, setShowAllPaths] = useState(false); // New state for showing all paths

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
      console.error("Failed to fetch zones:", error);
    }
  };

  // Load flight plans from API
  const fetchFlightPlans = async () => {
    setLoading(true);
    try {
      const res = await fetchFlightPlansAPI({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      console.log('📡 Flight Plans Response:', res);
      const plans = Array.isArray(res?.data) ? res.data : [];
      setFlightPlans(plans);
    } catch (error) {
      console.error("Failed to fetch flight plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
    fetchFlightPlans();
  }, []);

  // Get selected flight plan details
  const selectedPlan = showAllPaths ? null : flightPlans.find(plan => plan._id === selectedPlanId);

  // Create zone polygons
  const zonePolygons = mapZones.map((zone) => {
    if (!zone.coordinates || zone.coordinates.length < 3) return null;

    return (
      <Polygon
        key={zone.id}
        positions={zone.coordinates}
        pathOptions={{
          color:
            zone.type === "no_fly"
              ? "#ff0000"
              : zone.type === "restricted"
              ? "#ffd700"
              : "#007bff",
          weight: 2,
          opacity: 0.7,
          fillColor:
            zone.type === "no_fly"
              ? "#ff0000"
              : zone.type === "restricted"
              ? "#ffd700"
              : "#007bff",
          fillOpacity: 0.2,
        }}
        eventHandlers={{
          mouseover: () => {
            console.log("Hovered zone:", zone.name);
          },
          mouseout: () => {
            console.log("Left zone hover");
          },
        }}
      />
    );
  });

  return (
    <div>
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={4} style={{ margin: 0 }}>
              🗺️ Bản đồ Kế hoạch Bay
            </Title>
            <Space>
              <Select
                placeholder="Chọn kế hoạch bay"
                style={{ width: 250 }}
                value={selectedPlanId}
                onChange={setSelectedPlanId}
                allowClear
              >
                {flightPlans.map((plan) => (
                  <Option key={plan._id} value={plan._id}>
                    {plan.name || `Kế hoạch ${plan._id?.slice(-6)}`}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Tùy chọn"
                style={{ width: 150 }}
                value={showAllPaths ? "all" : "single"}
                onChange={(value) => setShowAllPaths(value === "all")}
              >
                <Option value="single">Một kế hoạch</Option>
                <Option value="all">Lấy toàn bộ</Option>
              </Select>
            </Space>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ height: "500px", borderRadius: "8px", overflow: "hidden" }}>
          <MapContainer
            center={[10.8231, 106.6297]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render zones */}
            <FeatureGroup>{zonePolygons}</FeatureGroup>

            {/* Render flight paths */}
            {showAllPaths ? (
              // Render all flight plans
              flightPlans.map((plan) => (
                plan.waypoints && plan.waypoints.length > 1 && (
                  <FeatureGroup key={plan._id}>
                    {/* Render waypoints for this plan */}
                    {plan.waypoints.map((wp, index) => (
                      <Marker
                        key={`${plan._id}-${index}`}
                        position={[wp.latitude, wp.longitude]}
                        icon={L.divIcon({
                          className: 'custom-div-icon',
                          html: `<div style="
                            background: ${plan.status === 'COMPLETED' ? '#52c41a' : '#1890ff'};
                            color: white;
                            border-radius: 50%;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                            font-weight: bold;
                          ">${index + 1}</div>`,
                          iconSize: [20, 20],
                          iconAnchor: [10, 10]
                        })}
                      >
                        <Popup>
                          <div style={{ minWidth: 200 }}>
                            <strong>{plan.name || `Kế hoạch ${plan._id?.slice(-6)}`}</strong>
                            <br />
                            <strong>Waypoint #{wp.sequenceNumber}</strong>
                            <br />
                            <strong>Action:</strong> {wp.action}
                            <br />
                            <strong>Altitude:</strong> {wp.altitude}m
                            <br />
                            <strong>Speed:</strong> {wp.speed}m/s
                            <br />
                            <strong>Time:</strong>{" "}
                            {wp.estimatedTime
                              ? dayjs(wp.estimatedTime).format("DD/MM/YYYY HH:mm")
                              : "N/A"}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    
                    {/* Render flight path for this plan */}
                    {plan.waypoints.length > 1 && (
                      <Polyline
                        positions={plan.waypoints.map(wp => [wp.latitude, wp.longitude])}
                        color={plan.status === 'COMPLETED' ? '#52c41a' : '#1890ff'}
                        weight={3}
                        opacity={0.8}
                      />
                    )}
                  </FeatureGroup>
                ))
              )
            ) : (
              // Render single selected flight plan
              selectedPlan && selectedPlan.waypoints && (
                <FeatureGroup>
                  {/* Render waypoints */}
                  {selectedPlan.waypoints.map((wp, index) => (
                    <Marker
                      key={index}
                      position={[wp.latitude, wp.longitude]}
                    >
                      <Popup>
                        <div style={{ minWidth: 200 }}>
                          <strong>Waypoint #{wp.sequenceNumber}</strong>
                          <br />
                          <strong>Action:</strong> {wp.action}
                          <br />
                          <strong>Altitude:</strong> {wp.altitude}m
                          <br />
                          <strong>Speed:</strong> {wp.speed}m/s
                          <br />
                          <strong>Time:</strong>{" "}
                          {wp.estimatedTime
                            ? dayjs(wp.estimatedTime).format("DD/MM/YYYY HH:mm")
                            : "N/A"}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Render flight path */}
                  {selectedPlan.waypoints.length > 1 && (
                    <Polyline
                      positions={selectedPlan.waypoints.map(wp => [wp.latitude, wp.longitude])}
                      color="blue"
                      weight={3}
                      opacity={0.8}
                      dashArray="5, 10"
                    />
                  )}
                </FeatureGroup>
              )
            )}
          </MapContainer>
        </div>

        {/* Flight plan info */}
        {!showAllPaths && selectedPlan && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>Thông tin Kế hoạch Bay</Title>
            <Space direction="vertical" size="small">
              <div>
                <strong>Tên:</strong> {selectedPlan.name || `Kế hoạch ${selectedPlan._id?.slice(-6)}`}
              </div>
              <div>
                <strong>Drone:</strong> {selectedPlan.drone?.model || "Chưa gán"}
              </div>
              <div>
                <strong>Trạng thái:</strong>{" "}
                <Tag color={selectedPlan.status === "COMPLETED" ? "green" : "blue"}>
                  {selectedPlan.status}
                </Tag>
              </div>
              <div>
                <strong>Số waypoints:</strong> {selectedPlan.waypoints?.length || 0}
              </div>
              <div>
                <strong>Ghi chú:</strong> {selectedPlan.notes || "Không có"}
              </div>
              <div>
                <strong>Ngày tạo:</strong>{" "}
                {dayjs(selectedPlan.createdAt).format("DD/MM/YYYY HH:mm")}
              </div>
            </Space>
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop: 16, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
          <Title level={5}>Chú thích</Title>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#ff0000",
                  borderRadius: 2,
                }}
              />
              <Text>Vùng cấm bay</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#ffd700",
                  borderRadius: 2,
                }}
              />
              <Text>Vùng hạn chế</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#007bff",
                  borderRadius: 2,
                }}
              />
              <Text>Đường bay</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "#52c41a",
                  borderRadius: 2,
                }}
              />
              <Text>Đường bay (Hoàn thành)</Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FlightPlansMap;
