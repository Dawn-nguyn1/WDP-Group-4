import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Button, Space, Typography, Tag, message, Modal, Form, Input, DatePicker, InputNumber } from 'antd';
import { PlayCircleOutlined, ClearOutlined, PlusOutlined, StopOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import FlightMap from '../components/flight/flight.map';
import '../components/flight/flight.css';
import FlightWaypointsCard from '../components/flight/flight.waypoints.card.jsx';
import FlightPlansCard from '../components/flight/flight.plans.card.jsx';
import FlightSaveModal from '../components/flight/flight.save.modal.jsx';
import dayjs from 'dayjs';
import { createFlightPlanAPI, fetchFlightPlansAPI } from '../services/api.service.js';

const { Title } = Typography;

const FlightPlanning = () => {
    const [waypoints, setWaypoints] = useState([]);
    const [selectedWaypoint, setSelectedWaypoint] = useState(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawingState, setDrawingState] = useState('idle'); // 'idle' | 'selecting_points' | 'adding_waypoints'
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simIndex, setSimIndex] = useState(0);
    const [calculatedPlannedEnd, setCalculatedPlannedEnd] = useState(null);
    const [form] = Form.useForm();
    const mapRef = useRef(null);
    const [saveOpen, setSaveOpen] = useState(false);

    const [plansLoading, setPlansLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [plansStatus, setPlansStatus] = useState(undefined);
    const [plansPagination, setPlansPagination] = useState({
        currentPage: 1,
        limit: 10,
        totalCount: 0,
    });

    const SIM_TICK_MS = 80;
    const SIM_STEP_METERS = 3; // càng nhỏ càng mượt, nhưng tốn CPU hơn
    const DEFAULT_SPEED_MS = 10;

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

    // Calculate planned end based on distance and default speed
    const calculatePlannedEnd = (plannedStart) => {
        const totalDistance = parseFloat(calculateTotalDistance());
        const defaultSpeed = 10; // m/s
        const flightTimeSeconds = totalDistance / defaultSpeed;
        
        console.log('=== CALCULATE PLANNED END ===');
        console.log('Total distance (m):', totalDistance);
        console.log('Default speed (m/s):', defaultSpeed);
        console.log('Flight time (seconds):', flightTimeSeconds);
        console.log('Flight time (minutes):', (flightTimeSeconds / 60).toFixed(2));
        
        const plannedEnd = plannedStart.add(flightTimeSeconds, 'second');
        console.log('Planned start:', plannedStart.format('YYYY-MM-DD HH:mm:ss'));
        console.log('Planned end:', plannedEnd.format('YYYY-MM-DD HH:mm:ss'));
        console.log('=== END CALCULATE PLANNED END ===');
        
        return plannedEnd;
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

    const loadPlans = async (override = {}) => {
        const page = override.page ?? plansPagination.currentPage ?? 1;
        const limit = override.limit ?? plansPagination.limit ?? 10;
        const status = override.status ?? plansStatus;
        try {
            setPlansLoading(true);
            const res = await fetchFlightPlansAPI({
                page,
                limit,
                ...(status ? { status } : {}),
            });

            setPlans(Array.isArray(res?.data) ? res.data : []);
            setPlansPagination(res?.pagination ?? { currentPage: page, limit, totalCount: 0 });
        } catch (err) {
            message.error(err?.message || 'Không thể tải danh sách flight plans');
            setPlans([]);
        } finally {
            setPlansLoading(false);
        }
    };

    useEffect(() => {
        loadPlans({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plansStatus]);

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

        console.log('=== MAP CLICK DEBUG ===');
        console.log('Clicked coordinates:', { lat, lng });
        console.log('New waypoint created:', newWaypoint);
        console.log('Current waypoints before add:', waypoints);
        console.log('Waypoints length after add:', waypoints.length + 1);

        setWaypoints([...waypoints, newWaypoint]);
        
        // Auto disable drawing after setting Point B
        if (waypoints.length === 1) {
            setIsDrawingMode(false);
            message.success('Đã thiết lập điểm A và B. Bạn có thể thêm waypoints trung gian.');
            console.log('Point A and B set, drawing mode disabled');
        }
        
        console.log('=== END MAP CLICK DEBUG ===');
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

    // Convert waypoints to API format
    const convertWaypointsToAPI = (plannedStart, plannedEnd) => {
        console.log('=== WAYPOINTS DEBUG INFO ===');
        console.log('Current waypoints:', waypoints);
        console.log('Number of waypoints:', waypoints.length);
        console.log('Planned start:', plannedStart);
        console.log('Planned end:', plannedEnd);
        
        const totalFlightTime = plannedEnd.diff(plannedStart, 'second'); // Total flight time in seconds
        const defaultSpeed = 10; // m/s
        
        console.log('Total flight time (s):', totalFlightTime);
        console.log('Default speed (m/s):', defaultSpeed);
        
        const apiWaypoints = waypoints.map((wp, index) => {
            const action = index === 0 ? 'TAKEOFF' : 
                          index === waypoints.length - 1 ? 'LAND' : 'WAYPOINT';
            
            // Speed: TAKEOFF = 0, others = 10m/s
            const speed = index === 0 ? 0 : defaultSpeed;
            
            // Calculate estimated time based on cumulative distance
            let estimatedTime = plannedStart;
            
            if (index > 0) {
                // Calculate cumulative distance up to this waypoint
                let cumulativeDistance = 0;
                for (let i = 0; i < index; i++) {
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
                    const distance = R * c * 1000; // Convert to meters
                    
                    cumulativeDistance += distance;
                }
                
                // Time = distance / speed
                const timeFromStart = cumulativeDistance / defaultSpeed;
                estimatedTime = plannedStart.add(timeFromStart, 'second');
            }
            
            const apiWaypoint = {
                sequenceNumber: index + 1,
                latitude: wp.lat,
                longitude: wp.lng,
                altitude: wp.altitude, // Default 100m
                speed: speed,
                estimatedTime: estimatedTime.toISOString(),
                action: action
            };
            
            console.log(`Waypoint ${index + 1}:`, {
                original: wp,
                api: apiWaypoint,
                action: action,
                speed: speed,
                estimatedTime: estimatedTime.format('YYYY-MM-DD HH:mm:ss')
            });
            
            return apiWaypoint;
        });
        
        console.log('Converted API waypoints:', apiWaypoints);
        console.log('=== END WAYPOINTS DEBUG ===');
        
        return apiWaypoints;
    };

    // Save flight plan
    const handleSaveFlightPlan = async (values) => {
        console.log('=== SAVE FLIGHT PLAN DEBUG ===');
        console.log('Form values:', values);
        console.log('Current waypoints state:', waypoints);
        
        if (waypoints.length < 2) {
            message.error('Cần ít nhất 2 điểm (A và B) để lưu flight plan');
            return;
        }

        try {
            setSaving(true);
            
            // Calculate planned end automatically
            const plannedEnd = calculatePlannedEnd(values.plannedStart);
            
            const apiWaypoints = convertWaypointsToAPI(values.plannedStart, plannedEnd);
            
            const payload = {
                drone: values.droneId,
                plannedStart: values.plannedStart.toISOString(),
                plannedEnd: plannedEnd.toISOString(),
                priority: values.priority || 1,
                waypoints: apiWaypoints,
                notes: values.notes || ''
            };
            
            console.log('Final payload to API:', payload);

            const res = await createFlightPlanAPI(payload);
            
            console.log('API response:', res);
            
            message.success('Flight plan đã được tạo thành công!');
            setSaveModalVisible(false);
            form.resetFields();
            setCalculatedPlannedEnd(null);
            
            // Refresh flight plans list
            loadPlans({ page: 1 });
            
        } catch (error) {
            console.error('Save flight plan error:', error);
            let errorMessage = 'Không thể tạo flight plan';
            
            if (error?.response?.status === 400) {
                errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
            } else if (error?.response?.status === 401) {
                errorMessage = 'Không được phân quyền. Vui lòng đăng nhập lại.';
            } else if (error?.response?.status === 403) {
                errorMessage = 'Bạn không sở hữu drone này.';
            } else if (error?.response?.status === 404) {
                errorMessage = 'Drone không tồn tại.';
            }
            
            message.error(errorMessage);
        } finally {
            setSaving(false);
            console.log('=== END SAVE FLIGHT PLAN DEBUG ===');
        }
    };

    // Open save modal and calculate planned end
    const openSaveModal = () => {
        if (waypoints.length < 2) {
            message.error('Cần ít nhất 2 điểm (A và B) để lưu flight plan');
            return;
        }
        
        setSaveModalVisible(true);
        
        // Set default planned start to current time
        const defaultStart = dayjs();
        const calculatedEnd = calculatePlannedEnd(defaultStart);
        
        setCalculatedPlannedEnd(calculatedEnd);
        
        form.setFieldsValue({
            plannedStart: defaultStart,
            priority: 1,
            notes: ''
        });
    };

    // Handle planned start change
    const handlePlannedStartChange = (date) => {
        if (date) {
            const calculatedEnd = calculatePlannedEnd(date);
            setCalculatedPlannedEnd(calculatedEnd);
        } else {
            setCalculatedPlannedEnd(null);
        }
    };

    const handleLoadPlan = async (plan) => {
        try {
            setIsDrawingMode(false);
            setIsSimulating(false);
            setSimIndex(0);

            // TODO: Implement load plan functionality when API is ready
            message.info('Chức năng load plan đang được phát triển');
        } catch (err) {
            message.error(err?.message || 'Không thể load flight plan');
        }
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
                    
                    <Button 
                        type="default"
                        icon={<SaveOutlined />}
                        onClick={openSaveModal}
                        disabled={waypoints.length < 2 || isDrawingMode}
                    >
                        Lưu plan
                    </Button>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => loadPlans({ page: plansPagination.currentPage })}
                    >
                        Refresh plans
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <FlightWaypointsCard
                        waypoints={waypoints}
                        selectedWaypoint={selectedWaypoint}
                        onSelectWaypoint={setSelectedWaypoint}
                        onDeleteWaypoint={deleteWaypoint}
                    />

                    <FlightPlansCard
                        plans={plans}
                        loading={plansLoading}
                        status={plansStatus}
                        onStatusChange={(v) => setPlansStatus(v)}
                        pagination={plansPagination}
                        onPageChange={(page, limit) => {
                            setPlansPagination((p) => ({ ...p, currentPage: page, limit }));
                            loadPlans({ page, limit });
                        }}
                        onLoadPlan={handleLoadPlan}
                    />
                </div>
            </div>

            <FlightSaveModal
                open={saveOpen}
                onCancel={() => setSaveOpen(false)}
                onSubmit={handleSaveFlightPlan}
                loading={saving}
                initialValues={{
                    plannedStart: dayjs(),
                    plannedEnd: dayjs().add(30, 'minute'),
                    priority: 1,
                    defaultSpeed: DEFAULT_SPEED_MS,
                }}
            />

            {/* Save Flight Plan Modal */}
            <Modal
                title="Lưu Flight Plan"
                open={saveModalVisible}
                onOk={() => form.submit()}
                onCancel={() => {
                    setSaveModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={saving}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveFlightPlan}
                    initialValues={{
                        plannedStart: dayjs(),
                        priority: 1,
                        notes: ''
                    }}
                >
                    <Form.Item
                        name="droneId"
                        label="Drone ID"
                        rules={[{ required: true, message: 'Vui lòng nhập Drone ID' }]}
                    >
                        <Input placeholder="Nhập ID của drone" />
                    </Form.Item>

                    <Form.Item
                        name="plannedStart"
                        label="Thời gian bắt đầu"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
                    >
                        <DatePicker 
                            showTime 
                            style={{ width: '100%' }}
                            placeholder="Chọn thời gian bắt đầu"
                            onChange={handlePlannedStartChange}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian kết thúc (tự động tính)"
                    >
                        <DatePicker 
                            showTime 
                            style={{ width: '100%' }}
                            placeholder="Thời gian kết thúc sẽ được tính tự động"
                            value={calculatedPlannedEnd}
                            disabled
                        />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Độ ưu tiên"
                        rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
                    >
                        <InputNumber 
                            min={1} 
                            max={10} 
                            style={{ width: '100%' }}
                            placeholder="1 (thấp) - 10 (cao)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Ghi chú"
                    >
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Ghi chú về chuyến bay (tùy chọn)"
                        />
                    </Form.Item>

                    <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginTop: '16px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Thông tin waypoints:</p>
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                            - Số điểm: {waypoints.length} (A, B và {Math.max(0, waypoints.length - 2)} điểm trung gian)<br/>
                            - Độ cao: {waypoints.map(w => w.altitude).join('m, ')}m<br/>
                            - Tốc độ: 10m/s (mặc định)<br/>
                            - Tổng khoảng cách: {calculateTotalDistance()}m<br/>
                            - Thời gian bay ước tính: {calculatedPlannedEnd ? 
                                `${calculatedPlannedEnd.diff(form.getFieldValue('plannedStart') || dayjs(), 'minute')} phút` : 
                                'Chưa tính'}
                        </p>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default FlightPlanning;
