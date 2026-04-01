import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import { fetchZonesAPI } from "../../../features/zones/services/zoneApi";
import { Button, Select, Space } from "antd";


const MapEvents = ({ onMapClickOutside }) => {
  useMapEvents({
    click: (e) => {
      // Check if click is on polygon or empty space
      if (e.originalEvent && e.originalEvent.target === e.originalEvent.currentTarget) {
        onMapClickOutside();
      }
    },
  });
  return null;
};

export default function Map({
  onReloadCallback,
  onZoneDeleted,
  onZoneClick,
  onMapClickOutside,
  zonesList,
  hoveredZoneId,
  selectedZoneId,
  onZoneHover,
}) {
  const [mapZones, setMapZones] = useState([]); // Zones để hiển thị trên map
  const [zoneFilter, setZoneFilter] = useState('all'); // Bộ lọc zone types
  const mapRef = useRef();

  // Load mock data khi component mount
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

  // Load zones khi component mount
  useEffect(() => {
    // console.log('Load mock no-fly zones:', mockNoFlyZones);
    // setMapZones(mockNoFlyZones);

    fetchZones();
  }, []);

  // Expose fetchZones function để có thể gọi từ bên ngoài
  // Chỉ gọi một lần khi component mount để tránh infinite loop
  useEffect(() => {
    if (onReloadCallback) {
      onReloadCallback(fetchZones);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  // Filter zones based on selected filter
  const getFilteredZones = () => {
    if (zoneFilter === 'all') return mapZones;
    if (zoneFilter === 'no_fly') return mapZones.filter(zone => zone.type === 'no_fly');
    if (zoneFilter === 'restricted') return mapZones.filter(zone => zone.type === 'restricted');
    return mapZones;
  };

  const filteredZones = getFilteredZones();

  return (
    <div>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f0f0f0",
          marginBottom: "10px",
        }}
      >
        <h3>Vùng cấm bay Flycam</h3>
        <p>Số lượng vùng cấm bay: {mapZones.length}</p>
      </div>

      {/* Map wrapper with controlled height */}
      <div style={{ 
        height: "800px", 
        width: "100%", 
        position: "relative",
        border: "1px solid #d9d9d9",
        borderRadius: "8px",
        overflow: "hidden"
      }}>
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
          center={[10.7769, 106.7009]}
          zoom={13}
          style={{ 
            height: "100%", 
            width: "100%"
          }}
          ref={mapRef}
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={[10.7769, 106.7009]}>
          <Popup>TP.HCM</Popup>
        </Marker>

        {/* MapEvents for click outside handling */}
        <MapEvents onMapClickOutside={onMapClickOutside} />

        {/* Render các polygon zones */}
        {filteredZones.map((zone) => {
          // Xác định màu dựa vào type của zone
          const getZoneColor = (type) => {
            if (type === "restricted") {
              return "#ffd700"; // Màu vàng cho restricted zone
            }
            return "#ff0000"; // Màu đỏ cho no_fly zone
          };

          const zoneColor = getZoneColor(zone.type);
          const isHovered = hoveredZoneId === zone.id;
          const isSelected = selectedZoneId === zone.id;

          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: isSelected || isHovered ? "#1890ff" : zoneColor,
                fillColor: zoneColor,
                fillOpacity: isSelected || isHovered ? 0.6 : 0.3,
                weight: isSelected || isHovered ? 5 : 2,
              }}
              eventHandlers={{
                add: (e) => {
                  // Lưu zone ID và name vào layer options khi polygon được thêm vào map
                  const layer = e.target;
                  layer.options.zoneId = zone.id;
                  layer.options.zoneName = zone.name;
                },
                click: () => {
                  if (onZoneClick) {
                    onZoneClick(zone.id);
                  }
                },
                mouseover: () => {
                  if (onZoneHover) {
                    onZoneHover(zone.id);
                  }
                },
                mouseout: () => {
                  if (onZoneHover && !isSelected) {
                    onZoneHover(null);
                  }
                },
              }}
            />
          );
        })}
      </MapContainer>
      </div>
    </div>
  );
}
