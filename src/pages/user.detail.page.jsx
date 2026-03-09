import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Tag, Button, Descriptions, Spin, message, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { getUserDetailAPI } from '../services/api.service';
import dayjs from 'dayjs';
import '../components/user/user.css';

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                setLoading(true);
                const res = await getUserDetailAPI(id);
                
                if (res?.user) {
                    setUser(res.user);
                } else {
                    message.error('Không tìm thấy thông tin người dùng');
                    navigate('/users');
                }
            } catch (error) {
                console.error('Fetch user detail error:', error);
                
                let errorMessage = 'Không thể tải thông tin người dùng';
                if (error?.response?.status === 401) {
                    errorMessage = 'Không được phân quyền. Vui lòng đăng nhập lại!';
                } else if (error?.response?.status === 403) {
                    errorMessage = 'Bạn không có quyền xem thông tin này!';
                } else if (error?.response?.status === 404) {
                    errorMessage = 'Không tìm thấy người dùng';
                }
                
                message.error(errorMessage);
                navigate('/users');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserDetail();
        }
    }, [id, navigate]);

    const handleEditUser = () => {
        navigate(`/users/edit/${id}`);
    };

    const handleBackToList = () => {
        navigate('/users');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'UTM_ADMIN':
                return 'red';
            case 'INDIVIDUAL_OPERATOR':
                return 'blue';
            case 'ORGANIZATION_OPERATOR':
                return 'green';
            default:
                return 'default';
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'UTM_ADMIN':
                return 'Quản trị viên UTM';
            case 'INDIVIDUAL_OPERATOR':
                return 'Cá nhân điều khiển';
            case 'ORGANIZATION_OPERATOR':
                return 'Tổ chức điều khiển';
            default:
                return role;
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'green' : 'default';
    };

    const getStatusText = (status) => {
        return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
    };

    if (loading) {
        return (
            <div className="user-page-container">
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px', color: '#666' }}>Đang tải thông tin người dùng...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="user-page-container">
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <p style={{ color: '#999' }}>Không tìm thấy thông tin người dùng</p>
                    <Button type="primary" onClick={handleBackToList}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-page-container">
            {/* Page Header */}
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Chi Tiết Người Dùng</h1>
                        <p className="page-subtitle">Xem và quản lý thông tin chi tiết người dùng</p>
                    </div>
                    <Space>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={handleBackToList}
                        >
                            Quay lại
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />}
                            onClick={handleEditUser}
                        >
                            Chỉnh sửa
                        </Button>
                    </Space>
                </div>
            </div>

            {/* User Info Card */}
            <Card 
                className="user-detail-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Avatar
                            size={80}
                            src={user.profile?.avatar}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: '#1890ff',
                                border: '3px solid #f0f0f0'
                            }}
                        />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                                {user.profile?.fullName || 'N/A'}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '16px' }}>
                                {user.email}
                            </p>
                        </div>
                    </div>
                }
            >
                <Descriptions 
                    column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                    size="middle"
                    bordered
                >
                    <Descriptions.Item label="ID người dùng">
                        <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                            {user._id}
                        </code>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Email">
                        {user.email}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Họ và tên">
                        {user.profile?.fullName || 'N/A'}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Số điện thoại">
                        {user.profile?.phone || 'N/A'}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Vai trò">
                        <Tag color={getRoleColor(user.role)}>
                            {getRoleText(user.role)}
                        </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={getStatusColor(user.status)}>
                            {getStatusText(user.status)}
                        </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(user.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Cập nhật lần cuối">
                        {dayjs(user.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                </Descriptions>

                {/* Avatar section */}
                {user.profile?.avatar && (
                    <div style={{ marginTop: '24px' }}>
                        <h4 style={{ marginBottom: '12px' }}>Ảnh đại diện</h4>
                        <img
                            src={user.profile.avatar}
                            alt="Avatar"
                            style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                border: '1px solid #d9d9d9',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default UserDetailPage;
