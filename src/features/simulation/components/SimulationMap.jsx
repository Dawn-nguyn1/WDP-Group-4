import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Create custom circular divIcon for waypoints (Matching style from WaypointEditorWithZones.jsx)
const createWaypointIcon = (sequenceNumber, action) => {
  let color = '#2563eb'; // Default Blue (WAYPOINT)
  if (action === 'TAKEOFF') color = '#22c55e'; // Green
  if (action === 'LAND') color = '#ef4444'; // Red

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background: ${color};
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
    ">${sequenceNumber}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Component để hiển thị Drone đang bay
const SimulationMap = ({
  currentMission,
  missionFlightPaths = [],
  dronesLiveProps = {}
}) => {

  // Lấy ra danh sách các waypoint và markers (điểm đầu/cuối)
  const { lines, markers, center } = useMemo(() => {
    let allLines = [];
    let allMarkers = [];
    let defaultCenter = [10.8231, 106.6297]; // Default HCMC

    // Ưu tiên dùng missionFlightPaths (dữ liệu chi tiết đã fetch)
    const sourceData = (missionFlightPaths && missionFlightPaths.length > 0) 
      ? missionFlightPaths 
      : (currentMission?.missionPlans?.map(p => p.flightPlan).filter(Boolean) || []);

    sourceData.forEach((fp, fpIdx) => {
      if (fp?.waypoints && fp.waypoints.length > 0) {
        const coords = fp.waypoints.map(wp => [wp.latitude, wp.longitude]);
        allLines.push(coords);
        
        // Render TẤT CẢ waypoints dưới dạng Marker
        fp.waypoints.forEach((wp, wpIdx) => {
          const isFirst = wpIdx === 0;
          const isLast = wpIdx === fp.waypoints.length - 1;
          
          // Xác định action hiển thị dựa trên vị trí để đảm bảo màu sắc chính xác
          let displayAction = 'WAYPOINT';
          if (isFirst) displayAction = 'TAKEOFF';
          else if (isLast) displayAction = 'LAND';

          allMarkers.push({
            position: [wp.latitude, wp.longitude],
            sequenceNumber: wp.sequenceNumber || (wpIdx + 1),
            action: displayAction, // Dùng displayAction để quyết định màu sắc
            label: `${displayAction}: ${fp.drone?.serialNumber || 'Drone'}`,
            id: `wp-${fp._id || fpIdx}-${wpIdx}`
          });
        });


        if (allLines.length === 1) defaultCenter = coords[0];
      }
    });


    return { lines: allLines, markers: allMarkers, center: defaultCenter };
  }, [currentMission, missionFlightPaths]);



  return (
    <div className="simulation-map-container" style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
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

        {/* Vẽ các Marker Điểm đầu (Start) và Điểm cuối (End) */}
        {markers.map(m => (
          <Marker 
            key={m.id} 
            position={m.position} 
            icon={createWaypointIcon(m.sequenceNumber, m.action)}
          >
            <Popup>
              <div className="text-sm font-semibold">
                {m.action === 'TAKEOFF' ? '🛫 ' : m.action === 'LAND' ? '🛬 ' : '📍 '} {m.label}
              </div>
            </Popup>

          </Marker>
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
                  <strong>{droneId.slice(-6)}</strong><br />
                  Spd: {Math.round(props.speed || 0)} m/s<br />
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

