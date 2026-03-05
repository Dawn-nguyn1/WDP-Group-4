import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { fetchZonesAPI } from "../../services/api.service";

//fake map data from BE
// Hard code data test - 2 vùng cấm bay polygon 4 đỉnh
// const mockNoFlyZones = [
//   {
//     id: 1,
//     type: 'polygon',
//     name: 'Vùng cấm bay 1',
//     description: 'Vùng cấm bay đa giác 4 đỉnh',
//     status: 'active',
//     coordinates: [
//       { lat: 10.7800, lng: 106.6900 },
//       { lat: 10.7850, lng: 106.6950 },
//       { lat: 10.7800, lng: 106.7000 },
//       { lat: 10.7750, lng: 106.6950 }
//     ],
//     altitude_min: 0,
//     altitude_max: 500,
//     area: 250000
//   },
//   {
//     id: 2,
//     type: 'polygon',
//     name: 'Vùng cấm bay 2',
//     description: 'Vùng cấm bay đa giác 4 đỉnh',
//     status: 'active',
//     coordinates: [
//       { lat: 10.7700, lng: 106.7100 },
//       { lat: 10.7750, lng: 106.7150 },
//       { lat: 10.7700, lng: 106.7200 },
//       { lat: 10.7650, lng: 106.7150 }
//     ],
//     altitude_min: 0,
//     altitude_max: 400,
//     area: 200000
//   }
// ];

export default function Map({ onReloadCallback, onZoneDeleted, onDeleteZone, zonesList, hoveredZoneId, onZoneHover, selectedZoneId, onZoneSelect }) {
  const [mapZones, setMapZones] = useState([]); // Zones để hiển thị trên map
  const mapRef = useRef();
  const featureGroupRef = useRef();

  // Load mock data khi component mount
  const fetchZones = async () => {
      try {
        const res = await fetchZonesAPI({
          page: 1,
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc',
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
                if (typeof lat !== 'number' || typeof lng !== 'number') return null;
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
        console.log('Fetch zones error:', error);
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

  // Hàm xử lý khi chỉnh sửa
  const handleEdited = (e) => {
    const { layers } = e;
    layers.eachLayer((layer) => {
      console.log('Layer đã được chỉnh sửa:', layer);
    });
  };

  // Hàm xử lý khi xóa
  const handleDeleted = (e) => {
    const { layers } = e;
    const zonesToDelete = [];
    
    // Lấy thông tin zone từ các layer bị xóa
    layers.eachLayer((layer) => {
      const zoneId = layer.options?.zoneId;
      if (zoneId) {
        zonesToDelete.push(zoneId);
      }
    });

    // Nếu có zone cần xóa, tìm zone trong danh sách và gọi hàm xóa từ zone.jsx
    if (zonesToDelete.length > 0 && onDeleteZone && zonesList) {
      const zoneId = zonesToDelete[0]; // Lấy zone đầu tiên (thường chỉ xóa một zone)
      
      // Tìm zone trong danh sách zones
      const zone = zonesList.find(z => z._id === zoneId);
      
      if (zone) {
        // Gọi hàm xóa từ zone.jsx (sẽ hiển thị modal và xử lý xóa)
        onDeleteZone(zone);
      } else {
        // Nếu không tìm thấy zone, reload lại zones để hiển thị lại polygon
        fetchZones();
      }
    } else {
      // Nếu không có callback hoặc danh sách zones, reload lại zones
      fetchZones();
    }
  };

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px' }}>
        <h3>Vùng cấm bay Flycam</h3>
        <p>Số lượng vùng cấm bay: {mapZones.length}</p>
      </div>
      
      <MapContainer
        center={[10.7769, 106.7009]}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={[10.7769, 106.7009]}>
          <Popup>TP.HCM</Popup>
        </Marker>


        {/* FeatureGroup để chứa các layer để có thể edit và delete */}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topleft"
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false,
              polygon: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false
            }}
            edit={{
              featureGroup: null, // Sẽ được set tự động bởi FeatureGroup
              remove: false // Không hiển thị nút xóa trên bản đồ
            }}
          />
          {/* Thêm các polygon vào FeatureGroup để có thể edit/delete */}
          {mapZones.map((zone) => {
            // Xác định màu dựa vào type của zone
            const getZoneColor = (type) => {
              if (type === 'restricted') {
                return '#ffd700'; // Màu vàng cho restricted zone
              }
              return '#ff0000'; // Màu đỏ cho no_fly zone
            };

            const zoneColor = getZoneColor(zone.type);
            const isHovered = hoveredZoneId === zone.id;
            const isSelected = selectedZoneId === zone.id;

            return (
              <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                  color: isSelected ? '#1890ff' : (isHovered ? '#1890ff' : zoneColor),
                  fillColor: zoneColor,
                  fillOpacity: isSelected ? 0.6 : (isHovered ? 0.5 : 0.3),
                  weight: isSelected ? 5 : (isHovered ? 4 : 2),
                  dashArray: isSelected ? null : null
                }}
                eventHandlers={{
                  add: (e) => {
                    // Lưu zone ID và name vào layer options khi polygon được thêm vào map
                    const layer = e.target;
                    layer.options.zoneId = zone.id;
                    layer.options.zoneName = zone.name;
                  },
                  mouseover: () => {
                    if (onZoneHover) {
                      onZoneHover(zone.id);
                    }
                  },
                  mouseout: () => {
                    if (onZoneHover) {
                      onZoneHover(null);
                    }
                  },
                  click: () => {
                    if (onZoneSelect) {
                      onZoneSelect(zone.id);
                    }
                  }
                }}
              />
            );
          })}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}