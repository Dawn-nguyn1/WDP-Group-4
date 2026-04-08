import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component để hiển thị Drone đang bay
const SimulationMap = ({ 
  currentMission, 
  dronesLiveProps = {} 
}) => {

  // Lấy ra danh sách các waypoint từ toàn bộ flight plans của mission để vẽ nét đứt
  const { lines, center } = useMemo(() => {
    let allLines = [];
    let defaultCenter = [10.8231, 106.6297]; // Default HCMC

    if (currentMission?.missionPlans) {
      currentMission.missionPlans.forEach(plan => {
        // Tuỳ theo BE trả về flightPlan object hay chỉ ID
        // Giả sử flightPlan đc populate chứa waypoints
        const waypoints = plan?.flightPlan?.waypoints;
        if (waypoints && waypoints.length > 0) {
          const coords = waypoints.map(wp => [wp.latitude, wp.longitude]);
          allLines.push(coords);
          defaultCenter = coords[0]; // lấy điểm bắt đầu tiên làm center
        }
      });
    }

    return { lines: allLines, center: defaultCenter };
  }, [currentMission]);

  return (
    <div className="simulation-map-container" style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Vẽ đường bay dự kiến (Polyline nét đứt màu xanh lá đậm) */}
        {lines.map((coords, index) => (
          <Polyline 
            key={`route-${index}`} 
            positions={coords} 
            pathOptions={{ color: '#059669', weight: 4, dashArray: '5, 10' }} 
          />
        ))}

        {/* Render danh sách Drone đang bay */}
        {Object.entries(dronesLiveProps).map(([droneId, props]) => {
          if (!props.lat || !props.lng) return null;

          // Drone đỏ (nhấp nháy) nếu có alert, xanh nếu bình thường
          const isAlert = !!props.alertText;
          const bgClass = isAlert ? 'bg-red-500 animate-pulse' : 'bg-blue-500';

          // Tạo icon emoji bằng thẻ div
          const iconHtml = `
            <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white ${bgClass}" 
                 style="transform: rotate(${props.heading || 0}deg); transition: transform 0.3s ease;">
              <span class="text-xl" style="transform: rotate(-${props.heading || 0}deg);">🚁</span>
            </div>
          `;

          const droneIcon = L.divIcon({
            html: iconHtml,
            className: '', // reset default leaflet class
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          return (
            <Marker key={droneId} position={[props.lat, props.lng]} icon={droneIcon}>
              <Tooltip direction="top" offset={[0, -16]} opacity={1} permanent={isAlert}>
                <div className="text-xs">
                  <strong>{droneId.slice(-6)}</strong><br/>
                  Spd: {Math.round(props.speed || 0)} m/s<br/>
                  Alt: {Math.round(props.alt || 0)} m
                  {isAlert && <div className="text-red-500 font-bold mt-1">⚠️ {props.alertText}</div>}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SimulationMap;
