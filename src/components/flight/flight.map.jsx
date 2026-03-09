import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { Card, InputNumber, Button, Space } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';

const createSimIcon = () => {
    return new DivIcon({
        className: 'custom-sim-marker',
        html: `
            <div style="
                width: 18px;
                height: 18px;
                border-radius: 999px;
                background: #111827;
                border: 3px solid #60a5fa;
                box-shadow: 0 8px 18px rgba(17, 24, 39, 0.25);
            "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
};

// Custom icons for waypoints
const createCustomIcon = (type, isSelected = false) => {
    const colors = {
        start: '#52c41a',
        end: '#ff4d4f', 
        intermediate: '#1890ff'
    };
    
    const color = colors[type] || '#1890ff';
    const scale = isSelected ? 1.3 : 1;
    
    return new DivIcon({
        className: 'custom-waypoint-marker',
        html: `
            <div style="
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                width: ${20 * scale}px;
                height: ${20 * scale}px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${10 * scale}px;
                cursor: pointer;
                transform: translate(-50%, -50%);
                position: relative;
            ">
                ${type === 'start' ? 'A' : type === 'end' ? 'B' : 'W'}
                ${isSelected ? '<div style="position: absolute; top: -8px; right: -8px; background: #1890ff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>' : ''}
            </div>
        `,
        iconSize: [20 * scale, 20 * scale],
        iconAnchor: [10 * scale, 10 * scale]
    });
};

// Map events component
const MapEvents = ({ onMapClick, isDrawingMode }) => {
    useMapEvents({
        click: (e) => {
            if (isDrawingMode && onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

// Waypoint popup component
const WaypointPopup = ({ waypoint, onUpdate }) => {
    const [altitude, setAltitude] = useState(waypoint.altitude);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        onUpdate(waypoint.id, { altitude });
        setIsEditing(false);
    };

    return (
        <div style={{ minWidth: 200 }}>
            <div style={{ marginBottom: 8 }}>
                <strong>{waypoint.name}</strong>
            </div>
            <div style={{ marginBottom: 8 }}>
                <small>Lat: {waypoint.lat}</small><br />
                <small>Lng: {waypoint.lng}</small>
            </div>
            
            {isEditing ? (
                <div>
                    <div style={{ marginBottom: 8 }}>
                        <label>Độ cao (m):</label><br />
                        <InputNumber
                            value={altitude}
                            onChange={setAltitude}
                            min={0}
                            max={500}
                            style={{ width: '100%', marginTop: 4 }}
                        />
                    </div>
                    <Space>
                        <Button size="small" icon={<SaveOutlined />} onClick={handleSave}>
                            Lưu
                        </Button>
                        <Button size="small" onClick={() => setIsEditing(false)}>
                            Hủy
                        </Button>
                    </Space>
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: 8 }}>
                        <strong>Độ cao:</strong> {waypoint.altitude}m
                    </div>
                    <Button size="small" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                        Chỉnh sửa
                    </Button>
                </div>
            )}
        </div>
    );
};

const FlightMap = forwardRef(({
    waypoints,
    selectedWaypoint,
    onMapClick,
    onWaypointSelect,
    onWaypointUpdate,
    isDrawingMode,
    simulatedPosition,
    isSimulating
}, ref) => {
    const mapRef = useRef(null);

    // Expose map methods to parent
    useImperativeHandle(ref, () => ({
        invalidateSize: () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        },
        fitToBounds: () => {
            if (mapRef.current && waypoints.length > 0) {
                const bounds = waypoints.map(wp => [wp.lat, wp.lng]);
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        },
        getMap: () => mapRef.current
    }));

    // Fit map to waypoints when they change
    useEffect(() => {
        if (mapRef.current && waypoints.length > 0) {
            const bounds = waypoints.map(wp => [wp.lat, wp.lng]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [waypoints]);

    // Handle waypoint click
    const handleWaypointClick = (waypoint) => {
        if (onWaypointSelect) {
            onWaypointSelect(waypoint.id);
        }
    };

    // Update waypoint
    const handleWaypointUpdate = (id, updates) => {
        if (onWaypointUpdate) {
            onWaypointUpdate(id, updates);
        }
    };

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer
                center={[10.7769, 106.7009]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Map events */}
                <MapEvents onMapClick={onMapClick} isDrawingMode={isDrawingMode} />

                {/* Flight path polyline */}
                {waypoints.length > 1 && (
                    <Polyline
                        positions={waypoints.map(wp => [wp.lat, wp.lng])}
                        pathOptions={{
                            color: isDrawingMode ? '#faad14' : '#52c41a',
                            weight: 3,
                            opacity: 0.8,
                            dashArray: isDrawingMode ? '10, 10' : null
                        }}
                    />
                )}

                {/* Waypoint markers */}
                {waypoints.map((waypoint) => (
                    <Marker
                        key={waypoint.id}
                        position={[waypoint.lat, waypoint.lng]}
                        icon={createCustomIcon(waypoint.type, selectedWaypoint === waypoint.id)}
                        eventHandlers={{
                            click: () => handleWaypointClick(waypoint),
                        }}
                    >
                        <Popup>
                            <WaypointPopup
                                waypoint={waypoint}
                                onUpdate={handleWaypointUpdate}
                            />
                        </Popup>
                    </Marker>
                ))}

                {/* Simulation marker */}
                {simulatedPosition && (
                    <Marker
                        key="sim-marker"
                        position={[simulatedPosition.lat, simulatedPosition.lng]}
                        icon={createSimIcon()}
                    >
                        <Popup>
                            <div style={{ minWidth: 200 }}>
                                <strong>Bay thử</strong>
                                <div style={{ marginTop: 6 }}>
                                    <small>Lat: {simulatedPosition.lat.toFixed(6)}</small><br />
                                    <small>Lng: {simulatedPosition.lng.toFixed(6)}</small><br />
                                    <small>Trạng thái: {isSimulating ? 'Đang chạy' : 'Dừng'}</small>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Drawing mode indicator */}
                {isDrawingMode && (
                    <div style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        fontSize: '12px',
                        color: '#faad14',
                        fontWeight: 'bold'
                    }}>
                        📍 Click để đặt {waypoints.length === 0 ? 'Point A' : 'Point B'}
                    </div>
                )}

                {/* Instructions */}
                {waypoints.length === 0 && !isDrawingMode && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        textAlign: 'center'
                    }}>
                        <h4>Bắt đầu tạo đường bay</h4>
                        <p>Nhấn nút "Tạo đường bay mới" và click trên bản đồ để đặt Point A và Point B</p>
                    </div>
                )}
            </MapContainer>
        </div>
    );
});

FlightMap.displayName = 'FlightMap';

export default FlightMap;
