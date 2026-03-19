import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { fetchZonesAPI } from "../../../features/zones/services/zoneApi";

// Fix Leaflet's default icon issue in React
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const FlightPlanMapWithZones = ({ waypoints = [], centerPosition = [10.7769, 106.7009] }) => {
  const [mapZones, setMapZones] = useState([]);
  const mapRef = useRef();

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

  // Tạo polyline positions từ waypoints
  const polylinePositions = waypoints?.map((wp) => [wp.latitude, wp.longitude]) || [];

  return (
    <div>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0f0f0",
          marginBottom: "10px",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: '8px' }}>Bản đồ Kế hoạch Bay & Vùng Cấm</h3>
        <p style={{ margin: 0, marginBottom: '8px' }}>Số lượng waypoints: {waypoints?.length || 0} | Vùng cấm: {mapZones.length}</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#ff0000', 
              marginRight: '4px',
              borderRadius: '2px'
            }}></span>
            Vùng cấm bay
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#ffd700', 
              marginRight: '4px',
              borderRadius: '2px'
            }}></span>
            Vùng hạn chế
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#007bff', 
              marginRight: '4px',
              borderRadius: '2px'
            }}></span>
            Lộ trình bay
          </span>
        </div>
      </div>

      <MapContainer
        center={centerPosition}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Render các polygon zones */}
        {mapZones.map((zone) => {
          // Xác định màu dựa vào type của zone
          const getZoneColor = (type) => {
            if (type === "restricted") {
              return "#ffd700"; // Màu vàng cho restricted zone
            }
            return "#ff0000"; // Màu đỏ cho no_fly zone
          };

          const zoneColor = getZoneColor(zone.type);

          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: zoneColor,
                fillColor: zoneColor,
                fillOpacity: 0.3,
                weight: 2,
                dashArray: "5, 5"
              }}
              eventHandlers={{
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: 0.5,
                    weight: 3
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: 0.3,
                    weight: 2
                  });
                }
              }}
            >
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <strong style={{ color: zoneColor }}>{zone.name}</strong>
                  <br />
                  <span style={{ color: '#666' }}>Loại: {zone.type}</span>
                  <br />
                  <span style={{ color: '#666' }}>Độ cao: {zone.altitude_min}m - {zone.altitude_max}m</span>
                  <br />
                  <span style={{ color: '#ff4444', fontWeight: 'bold' }}>⚠️ Vùng cấm bay</span>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Render waypoints */}
        {waypoints?.map((wp, index) => (
          <Marker key={index} position={[wp.latitude, wp.longitude]}>
            <Popup>
              <strong>
                {wp.action} (WP #{wp.sequenceNumber})
              </strong>
              <br />
              Độ cao: {wp.altitude}m<br />
              Tốc độ: {wp.speed}m/s
            </Popup>
          </Marker>
        ))}

        {/* Render flight path */}
        {polylinePositions.length > 1 && (
          <Polyline 
            positions={polylinePositions} 
            color="blue" 
            weight={3}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default FlightPlanMapWithZones;
