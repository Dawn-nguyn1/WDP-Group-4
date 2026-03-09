import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Button, Space, Typography, Tag, message } from 'antd';
import { PlayCircleOutlined, ClearOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import FlightMap from '../components/flight/flight.map';
import '../components/flight/flight.css';

const { Title } = Typography;

const FlightPlanning = () => {
    const [waypoints, setWaypoints] = useState([]);
    const [selectedWaypoint, setSelectedWaypoint] = useState(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simIndex, setSimIndex] = useState(0);
    const mapRef = useRef(null);

    const SIM_TICK_MS = 80;
    const SIM_STEP_METERS = 3; // càng nhỏ càng mượt, nhưng tốn CPU hơn

    // Calculate total distance
    const calculateTotalDistance = () => {
        if (waypoints.length < 2) return 0;
        
        let totalDistance = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const lat1 = waypoints[i].lat;
            const lng1 = waypoints[i].lng;
            const lat2 = waypoints[i + 1].lat;
            const lng2 = waypoints[i + 1].lng;
            
            // Haversine formula
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            totalDistance += R * c;
        }
        
        return (totalDistance * 1000).toFixed(2); // Convert to meters
    };

    const haversineMeters = (a, b) => {
        const R = 6371000; // meters
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const lat1 = a.lat * Math.PI / 180;
        const lat2 = b.lat * Math.PI / 180;
        const h =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
        return R * c;
    };

    const buildSimPath = (wps, stepMeters) => {
        if (!Array.isArray(wps) || wps.length < 2) return [];

        const pts = [];
        for (let i = 0; i < wps.length - 1; i++) {
            const from = { lat: wps[i].lat, lng: wps[i].lng };
            const to = { lat: wps[i + 1].lat, lng: wps[i + 1].lng };
            const dist = haversineMeters(from, to);
            const steps = Math.max(1, Math.ceil(dist / stepMeters));

            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                pts.push({
                    lat: from.lat + (to.lat - from.lat) * t,
                    lng: from.lng + (to.lng - from.lng) * t,
                });
            }
        }
        return pts;
    };

    const simPath = useMemo(() => {
        if (waypoints.length < 2) return [];
        return buildSimPath(waypoints, SIM_STEP_METERS);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [waypoints]);

    useEffect(() => {
        if (!isSimulating) return;
        if (!simPath.length) return;

        const t = setInterval(() => {
            setSimIndex((prev) => {
                const next = prev + 1;
                if (next >= simPath.length) {
                    window.clearInterval(t);
                    setIsSimulating(false);
                    message.success('Bay thử hoàn tất.');
                    return 0;
                }
                return next;
            });
        }, SIM_TICK_MS);

        return () => window.clearInterval(t);
    }, [isSimulating, simPath.length]);

    // Handle map click to add waypoint
    const handleMapClick = (lat, lng) => {
        if (!isDrawingMode) return;

        const newWaypoint = {
            id: Date.now(),
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6)),
            altitude: 100, // Default altitude in meters
            name: waypoints.length === 0 ? 'Point A' : 
                  waypoints.length === 1 ? 'Point B' : `Waypoint ${waypoints.length - 1}`,
            type: waypoints.length === 0 ? 'start' : 
                  waypoints.length === 1 ? 'end' : 'intermediate'
        };

        setWaypoints([...waypoints, newWaypoint]);
        
        // Auto disable drawing after setting Point B
        if (waypoints.length === 1) {
            setIsDrawingMode(false);
            message.success('Đã thiết lập điểm A và B. Bạn có thể thêm waypoints trung gian.');
        }
    };

    // Update waypoint
    const updateWaypoint = (id, updates) => {
        setWaypoints(waypoints.map(wp => 
            wp.id === id ? { ...wp, ...updates } : wp
        ));
    };

    // Delete waypoint
    const deleteWaypoint = (id) => {
        const newWaypoints = waypoints.filter(wp => wp.id !== id);
        
        // Recalculate types after deletion
        const updatedWaypoints = newWaypoints.map((wp, index) => ({
            ...wp,
            type: index === 0 ? 'start' : index === newWaypoints.length - 1 ? 'end' : 'intermediate',
            name: index === 0 ? 'Point A' : index === 1 ? 'Point B' : `Waypoint ${index - 1}`
        }));
        
        setWaypoints(updatedWaypoints);
        setSelectedWaypoint(null);
    };

    // Clear all waypoints
    const clearAllWaypoints = () => {
        setWaypoints([]);
        setSelectedWaypoint(null);
        setIsDrawingMode(false);
        setIsSimulating(false);
        setSimIndex(0);
    };

    // Start drawing mode
    const startDrawing = () => {
        clearAllWaypoints();
        setIsDrawingMode(true);
        message.info('Click trên bản đồ để đặt Point A, sau đó Point B');
    };

    const stopDrawing = () => {
        setIsDrawingMode(false);
        setWaypoints([]);
        setSelectedWaypoint(null);
        setIsSimulating(false);
        setSimIndex(0);
        message.info('Đã dừng vẽ đường bay.');
    };

    const toggleSimulate = () => {
        if (waypoints.length < 2) return;
        if (isDrawingMode) return;

        if (isSimulating) {
            setIsSimulating(false);
            setSimIndex(0);
            message.info('Đã dừng bay thử.');
            return;
        }

        if (!simPath.length) {
            message.error('Không đủ dữ liệu để bay thử.');
            return;
        }

        setSimIndex(0);
        setIsSimulating(true);
        message.success('Bắt đầu bay thử...');
    };

    return (
        <div className="flight-planning-container">
            {/* Header */}
            <div className="flight-header">
                <Title level={2}>Flight Planning</Title>
                <p>Thiết lập đường bay cho Flycam - Chọn Point A và B, thêm waypoints trung gian</p>
            </div>

            {/* Control Panel */}
            <Card className="control-panel" title="Bảng điều khiển">
                <Space wrap>
                    <Button 
                        type={isDrawingMode ? "primary" : "default"}
                        icon={<PlusOutlined />}
                        onClick={startDrawing}
                        disabled={isDrawingMode}
                    >
                        {isDrawingMode ? 'Đang vẽ...' : 'Tạo đường bay mới'}
                    </Button>

                    {isDrawingMode && (
                        <Button
                            danger
                            icon={<StopOutlined />}
                            onClick={stopDrawing}
                        >
                            Dừng vẽ
                        </Button>
                    )}
                    
                    <Button 
                        icon={<ClearOutlined />}
                        onClick={clearAllWaypoints}
                        disabled={waypoints.length === 0}
                    >
                        Xóa tất cả
                    </Button>
                    
                    <Button 
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={toggleSimulate}
                        disabled={waypoints.length < 2 || isDrawingMode}
                    >
                        {isSimulating ? 'Dừng bay thử' : 'Bay thử'}
                    </Button>
                </Space>

                {/* Flight Info */}
                {waypoints.length > 0 && (
                    <div className="flight-info" style={{ marginTop: 16 }}>
                        <Space wrap>
                            <Tag color="blue">Số điểm: {waypoints.length}</Tag>
                            <Tag color="green">Tổng khoảng cách: {calculateTotalDistance()}m</Tag>
                            <Tag color="orange">Độ cao TB: {Math.round(waypoints.reduce((sum, wp) => sum + wp.altitude, 0) / waypoints.length)}m</Tag>
                        </Space>
                    </div>
                )}
            </Card>

            <div className="flight-content">
                {/* Map */}
                <Card className="map-card" title="Bản đồ">
                    <FlightMap
                        ref={mapRef}
                        waypoints={waypoints}
                        selectedWaypoint={selectedWaypoint}
                        onMapClick={handleMapClick}
                        onWaypointSelect={setSelectedWaypoint}
                        onWaypointUpdate={updateWaypoint}
                        isDrawingMode={isDrawingMode}
                        simulatedPosition={isSimulating && simPath.length ? simPath[simIndex] : null}
                        isSimulating={isSimulating}
                    />
                </Card>

                {/* Waypoints List */}
                <Card className="waypoints-card" title="Danh sách Waypoints">
                    <div className="waypoints-list">
                        {waypoints.length === 0 ? (
                            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                                Chưa có waypoints. Nhấn "Tạo đường bay mới" để bắt đầu.
                            </p>
                        ) : (
                            waypoints.map((waypoint, index) => (
                                <div
                                    key={waypoint.id}
                                    className={`waypoint-item ${selectedWaypoint === waypoint.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedWaypoint(waypoint.id)}
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
                                        <div className="waypoint-altitude">
                                            Độ cao: {waypoint.altitude}m
                                        </div>
                                    </div>
                                    <div className="waypoint-actions">
                                        <Button 
                                            size="small" 
                                            danger
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteWaypoint(waypoint.id);
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
            </div>
        </div>
    );
};

export default FlightPlanning;
