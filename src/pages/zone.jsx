import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Tag, Spin, Button, Modal, notification } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Map from '../components/user/map';
import ZoneForm from '../components/zone/zone.form';
import { fetchZonesAPI, deleteZoneAPI } from '../services/api.service';
import dayjs from 'dayjs';
import '../components/user/user.css';

const ZonePage = () => {
    const [reloadZones, setReloadZones] = useState(null);
    const [zonesList, setZonesList] = useState([]);
    const [loadingZones, setLoadingZones] = useState(false);
    const [hoveredZoneId, setHoveredZoneId] = useState(null); // Track zone đang được hover
    const [selectedZoneId, setSelectedZoneId] = useState(null); // Track zone được chọn (toggle)
    const reloadZonesRef = useRef(null);

    const handleReloadCallback = useCallback((fetchFunction) => {
        if (fetchFunction && typeof fetchFunction === 'function') {
            reloadZonesRef.current = fetchFunction;
            setReloadZones(() => fetchFunction);
        }
    }, []);

    // Fetch danh sách zones từ API
    const fetchZonesList = async () => {
        setLoadingZones(true);
        try {
            const res = await fetchZonesAPI({
                page: 1,
                limit: 100,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            const apiZones = Array.isArray(res?.data) ? res.data : [];
            setZonesList(apiZones);
        } catch (error) {
            console.error('Fetch zones error:', error);
            setZonesList([]);
        } finally {
            setLoadingZones(false);
        }
    };

    // Fetch zones khi component mount
    useEffect(() => {
        fetchZonesList();
    }, []);

    // Reload zones khi có zone mới được tạo
    const handleZoneCreated = async () => {
        await fetchZonesList();
        if (reloadZonesRef.current) {
            await reloadZonesRef.current();
        }
    };

    // Reload zones khi có zone bị xóa từ map
    const handleZoneDeleted = async () => {
        await fetchZonesList();
        if (reloadZonesRef.current) {
            await reloadZonesRef.current();
        }
    };

    // Xử lý xóa zone
    const handleDeleteZone = (zone) => {
        Modal.confirm({
            title: 'Xác nhận xóa vùng cấm bay',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa vùng cấm bay "${zone.name}"? (Zone sẽ được archive)`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await deleteZoneAPI(zone._id);
                    
                    if (res && res.message) {
                        notification.success({
                            message: 'Xóa zone thành công',
                            description: `Đã archive zone "${zone.name}" thành công!`
                        });
                        
                        // Refresh danh sách zones
                        await fetchZonesList();
                        if (reloadZonesRef.current) {
                            await reloadZonesRef.current();
                        }
                    } else {
                        notification.error({
                            message: 'Lỗi xóa zone',
                            description: 'Không nhận được phản hồi hợp lệ từ server'
                        });
                    }
                } catch (error) {
                    console.error('Delete zone error:', error);
                    
                    // Xử lý các loại lỗi khác nhau
                    let errorMessage = 'Xóa zone thất bại, vui lòng thử lại!';
                    
                    if (error?.message) {
                        errorMessage = error.message;
                    } else if (error?.response) {
                        const status = error.response.status;
                        if (status === 401) {
                            errorMessage = 'Không được xác thực. Vui lòng đăng nhập lại!';
                        } else if (status === 404) {
                            errorMessage = 'Không tìm thấy zone cần xóa!';
                        } else if (status === 500) {
                            errorMessage = error.response.data?.message || 'Lỗi server. Vui lòng thử lại sau!';
                        } else {
                            errorMessage = error.response.data?.message || `Lỗi ${status}`;
                        }
                    }
                    
                    notification.error({
                        message: 'Lỗi xóa zone',
                        description: errorMessage
                    });
                }
            }
        });
    };

    // Toggle chọn/bỏ chọn zone khi click trên map hoặc danh sách
    const handleZoneSelect = useCallback((zoneId) => {
        setSelectedZoneId(prev => prev === zoneId ? null : zoneId);
    }, []);

    return (
        <div className="user-page-container">
            <div className="page-header">
                <h1 className="page-title">Zone Management</h1>
                <p className="page-subtitle">Manage and draw no-fly zones on the map</p>
            </div>

            <ZoneForm loadZones={handleZoneCreated} />

            <Map 
                onReloadCallback={handleReloadCallback} 
                onZoneDeleted={handleZoneDeleted}
                onDeleteZone={handleDeleteZone}
                zonesList={zonesList}
                hoveredZoneId={hoveredZoneId}
                onZoneHover={setHoveredZoneId}
                selectedZoneId={selectedZoneId}
                onZoneSelect={handleZoneSelect}
            />

            {/* Danh sách vùng cấm bay */}
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                    Danh Sách Vùng Cấm Bay
                </h2>
                {loadingZones ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                    </div>
                ) : zonesList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Chưa có vùng cấm bay nào
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                        {zonesList.map((zone, index) => {
                            const isSelected = selectedZoneId === zone._id;
                            const isHovered = hoveredZoneId === zone._id;
                            
                            return (
                            <div
                                key={zone._id}
                                style={{
                                    padding: '16px',
                                    border: isSelected 
                                        ? '3px solid #1890ff' 
                                        : (isHovered ? '2px solid #1890ff' : '1px solid #e8e8e8'),
                                    borderRadius: '8px',
                                    backgroundColor: isSelected ? '#f0f8ff' : '#fafafa',
                                    transition: 'all 0.3s',
                                    boxShadow: isSelected
                                        ? '0 6px 16px rgba(24, 144, 255, 0.5)' 
                                        : (isHovered 
                                            ? '0 4px 12px rgba(24, 144, 255, 0.4)' 
                                            : '0 2px 4px rgba(0,0,0,0.05)'),
                                    transform: isSelected ? 'translateY(-3px) scale(1.02)' : (isHovered ? 'translateY(-2px)' : 'translateY(0)'),
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onMouseEnter={() => {
                                    setHoveredZoneId(zone._id);
                                }}
                                onMouseLeave={() => {
                                    setHoveredZoneId(null);
                                }}
                                onClick={() => handleZoneSelect(zone._id)}
                            >
                                {/* Indicator cho selected zone */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: '#1890ff',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}>
                                        ✓
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ 
                                            fontWeight: 'bold', 
                                            fontSize: '16px', 
                                            marginBottom: '6px', 
                                            color: isSelected ? '#096dd9' : '#1890ff' 
                                        }}>
                                            {index + 1}. {zone.name}
                                        </div>
                                        {zone.description && (
                                            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', lineHeight: '1.5' }}>
                                                {zone.description}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: '12px', alignItems: 'flex-start' }}>
                                        <Tag color={zone.status === 'active' ? 'green' : 'default'}>
                                            {zone.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                        </Tag>
                                        <Tag color={
                                            zone.type === 'no_fly' ? 'red' :
                                            zone.type === 'restricted' ? 'orange' : 'blue'
                                        }>
                                            {zone.type === 'no_fly' ? 'Cấm bay' :
                                             zone.type === 'restricted' ? 'Hạn chế' : 'Cảnh báo'}
                                        </Tag>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#666', paddingTop: '12px', borderTop: '1px solid #e8e8e8', marginBottom: '12px' }}>
                                    <div>
                                        <strong>Độ cao:</strong> {zone.minAltitude}m - {zone.maxAltitude}m
                                    </div>
                                    <div>
                                        <strong>Ngày tạo:</strong> {dayjs(zone.createdAt).format('DD/MM/YYYY HH:mm')}
                                    </div>
                                    {zone.effectiveFrom && (
                                        <div>
                                            <strong>Có hiệu lực từ:</strong> {dayjs(zone.effectiveFrom).format('DD/MM/YYYY HH:mm')}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteZone(zone);
                                        }}
                                        size="small"
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZonePage;
