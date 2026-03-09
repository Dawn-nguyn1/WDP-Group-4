import React from 'react';
import { Button, Card } from 'antd';

const FlightWaypointsCard = ({
  waypoints,
  selectedWaypoint,
  onSelectWaypoint,
  onDeleteWaypoint,
}) => {
  return (
    <Card className="waypoints-card" title="Danh sách Waypoints">
      <div className="waypoints-list">
        {waypoints.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
            Chưa có waypoints. Nhấn "Tạo đường bay mới" để bắt đầu.
          </p>
        ) : (
          waypoints.map((waypoint) => (
            <div
              key={waypoint.id}
              className={`waypoint-item ${selectedWaypoint === waypoint.id ? 'selected' : ''}`}
              onClick={() => onSelectWaypoint?.(waypoint.id)}
              role="button"
              tabIndex={0}
            >
              <div className="waypoint-info">
                <div className="waypoint-name">
                  <span className={`waypoint-type ${waypoint.type}`}>
                    {waypoint.type === 'start' ? 'A' : waypoint.type === 'end' ? 'B' : 'W'}
                  </span>
                  {waypoint.name}
                </div>
                <div className="waypoint-coords">
                  {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}
                </div>
                <div className="waypoint-altitude">Độ cao: {waypoint.altitude}m</div>
              </div>
              <div className="waypoint-actions">
                <Button
                  size="small"
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWaypoint?.(waypoint.id);
                  }}
                  disabled={waypoints.length <= 2}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default FlightWaypointsCard;

