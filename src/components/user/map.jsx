import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, Polygon, Rectangle } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

//fake map data from BE
// Hard code data test - 2 vùng cấm bay polygon 4 đỉnh
const mockNoFlyZones = [
  {
    id: 1,
    type: 'polygon',
    name: 'Vùng cấm bay 1',
    description: 'Vùng cấm bay đa giác 4 đỉnh',
    status: 'active',
    coordinates: [
      { lat: 10.7800, lng: 106.6900 },
      { lat: 10.7850, lng: 106.6950 },
      { lat: 10.7800, lng: 106.7000 },
      { lat: 10.7750, lng: 106.6950 }
    ],
    altitude_min: 0,
    altitude_max: 500,
    area: 250000
  },
  {
    id: 2,
    type: 'polygon',
    name: 'Vùng cấm bay 2',
    description: 'Vùng cấm bay đa giác 4 đỉnh',
    status: 'active',
    coordinates: [
      { lat: 10.7700, lng: 106.7100 },
      { lat: 10.7750, lng: 106.7150 },
      { lat: 10.7700, lng: 106.7200 },
      { lat: 10.7650, lng: 106.7150 }
    ],
    altitude_min: 0,
    altitude_max: 400,
    area: 200000
  }
];

export default function Map() {
  const [noFlyZones, setNoFlyZones] = useState([]);
  const [mapZones, setMapZones] = useState([]); // Zones để hiển thị trên map
  const mapRef = useRef();

  // Load mock data khi component mount
  useEffect(() => {
    console.log('Load mock no-fly zones:', mockNoFlyZones);
    setMapZones(mockNoFlyZones);
  }, []);

  // Xử lý khi tạo vùng cấm bay mới
  const handleCreated = (e) => {
    const { layerType, layer } = e;
    
    if (layerType === 'rectangle' || layerType === 'polygon') {
      // Lấy tọa độ của vùng vẽ
      const bounds = layer.getBounds ? layer.getBounds() : null;
      const latlngs = layer.getLatLngs ? layer.getLatLngs() : null;
      
      let zoneData = {
        type: layerType,
        id: Date.now(), // ID tạm thời
        timestamp: new Date().toISOString(),
        // Thông tin cho Backend
        name: `Vùng cấm bay ${noFlyZones.length + 1}`, // Tên tự động
        description: `Vùng cấm bay ${layerType === 'rectangle' ? 'hình chữ nhật' : 'đa giác'}`, // Mô tả
        status: 'active', // Trạng thái
        createdBy: 'current_user', // TODO: Lấy từ user login
        altitude_min: 0, // Độ cao tối thiểu (mét)
        altitude_max: 500 // Độ cao tối đa (mét)
      };
      
      if (layerType === 'rectangle' && bounds) {
        // Đối với hình chữ nhật
        zoneData.coordinates = {
          northEast: bounds.getNorthEast(),
          southWest: bounds.getSouthWest()
        };
        zoneData.area = calculateRectangleArea(bounds);
      } else if (layerType === 'polygon' && latlngs) {
        // Đối với polygon
        console.log('DEBUG: latlngs =', latlngs);
        console.log('DEBUG: latlngs[0] =', latlngs[0]);
        console.log('DEBUG: Số lượng đỉnh =', latlngs[0].length);
        
        zoneData.coordinates = latlngs[0]; // Lấy ring đầu tiên
        zoneData.area = calculatePolygonArea(latlngs[0]);
      }
      
      // Thêm vào danh sách vùng cấm bay
      setNoFlyZones(prev => [...prev, zoneData]);
      
      // In ra console để kiểm tra
      console.log('Vùng cấm bay mới được tạo:', zoneData);
      console.log('Tất cả vùng cấm bay:', [...noFlyZones, zoneData]);
      
      // Hiển thị thông báo
      alert(`Đã tạo vùng cấm bay ${layerType === 'rectangle' ? 'hình chữ nhật' : 'polygon'} mới!`);
    }
  };

  // Tính diện tích hình chữ nhật (đơn vị: mét vuông)
  const calculateRectangleArea = (bounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const width = ne.distanceTo([ne.lat, sw.lng]); // chiều rộng
    const height = ne.distanceTo([sw.lat, ne.lng]); // chiều cao
    return Math.round(width * height);
  };

  // Tính diện tích polygon (đơn vị: mét vuông)
  const calculatePolygonArea = (latlngs) => {
    let area = 0;
    for (let i = 0; i < latlngs.length; i++) {
      let j = (i + 1) % latlngs.length;
      area += latlngs[i].lat * latlngs[j].lng;
      area -= latlngs[j].lat * latlngs[i].lng;
    }
    area = Math.abs(area) * 111320 * 111320 / 2; // Chuyển đổi sang mét vuông
    return Math.round(area);
  };

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px' }}>
        <h3>Vùng cấm bay Flycam</h3>
        <p>Số lượng vùng cấm bay (vẽ): {noFlyZones.length}</p>
        <p>Số lượng vùng cấm bay (mock data): {mapZones.length}</p>
        <p>Hướng dẫn: Sử dụng công cụ vẽ ở góc trên bên trái bản đồ để tạo vùng cấm bay</p>
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

        {/* Hiển thị các vùng cấm bay từ mock data */}
        {mapZones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={{
              color: '#ff0000',
              fillColor: '#ff0000',
              fillOpacity: 0.3,
              weight: 2
            }}
          />
        ))}

        {/* FeatureGroup để chứa các layer được vẽ */}
        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: {
                shapeOptions: {
                  color: '#ff0000',
                  fillColor: '#ff0000',
                  fillOpacity: 0.3,
                  weight: 2
                },
                showArea: true,
                showLength: true
              },
              polygon: {
                shapeOptions: {
                  color: '#ff0000',
                  fillColor: '#ff0000',
                  fillOpacity: 0.3,
                  weight: 2
                },
                showArea: true,
                showLength: true
              },
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false
            }}
          />
        </FeatureGroup>
      </MapContainer>
      
      {/* Hiển thị danh sách vùng cấm bay */}
      {noFlyZones.length > 0 && (
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9', marginTop: '10px' }}>
          <h4>Danh sách vùng cấm bay:</h4>
          {noFlyZones.map((zone, index) => (
            <div key={zone.id} style={{ padding: '5px', border: '1px solid #ddd', margin: '5px 0' }}>
              <strong>Vùng {index + 1}:</strong> {zone.type} - 
              Diện tích: {zone.area.toLocaleString()} m² - 
              Thời gian: {new Date(zone.timestamp).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hàm xử lý khi chỉnh sửa
function handleEdited(e) {
  const { layers } = e;
  layers.eachLayer((layer) => {
    console.log('Layer đã được chỉnh sửa:', layer);
  });
}

// Hàm xử lý khi xóa
function handleDeleted(e) {
  const { layers } = e;
  layers.eachLayer((layer) => {
    console.log('Layer đã bị xóa:', layer);
  });
}