import React from "react";
import { Modal, Card, Row, Col, Tag, Avatar, Typography, notification } from "antd";
import { useState, useEffect } from "react";
import { getUserDetailAPI, patchUserAPI } from "../services/userApi";
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ViewUserDetail = (props) => {
  const { dataDetail, setDataDetail, isDetailOpen, setIsDetailOpen, loadUser } =
    props;

  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    if (isDetailOpen && dataDetail?._id) {
      fetchUserDetail();
    }
  }, [isDetailOpen, dataDetail?._id]);

  const fetchUserDetail = async () => {
    try {
      const res = await getUserDetailAPI(dataDetail._id);

      if (res && res._id) {
        setUserDetail(res);
      } else if (res && res.data) {
        setUserDetail(res.data);
      } else {
        notification.error({
          message: "Error",
          description: "Không thể tải thông tin user",
        });
      }
    } catch (error) {
      console.error("Fetch user detail error:", error);
      notification.error({
        message: "Error",
        description: error?.message || "Lỗi khi tải thông tin user",
      });
    }
  };

  const handleClose = () => {
    setDataDetail(null);
    setUserDetail(null);
    setIsDetailOpen(false);
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'INACTIVE':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'PENDING':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'UTM_ADMIN':
        return 'red';
      case 'FLEET_OPERATOR':
        return 'blue';
      case 'INDIVIDUAL':
        return 'green';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Chi tiết User</span>
        </div>
      }
      open={isDetailOpen}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered
      styles={{ body: { padding: '24px' } }}
    >
      {userDetail ? (
        <div>
          {/* Header Card */}
          <Card 
            style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Row align="middle" gutter={16}>
              <Col>
                <Avatar 
                  size={64} 
                  src={userDetail.profile?.avatar}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#fff', color: '#667eea' }}
                />
              </Col>
              <Col flex={1}>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {userDetail.profile?.fullName || 'N/A'}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  {userDetail.email}
                </Text>
              </Col>
              <Col>
                <Tag color={getStatusColor(userDetail.status)} icon={getStatusIcon(userDetail.status)}>
                  {userDetail.status || 'UNKNOWN'}
                </Tag>
              </Col>
            </Row>
          </Card>

          {/* Info Grid */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" title="Thông tin cá nhân">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>ID:</Text>
                    <Text code>{userDetail._id}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PhoneOutlined style={{ color: '#52c41a' }} />
                    <Text strong>SĐT:</Text>
                    <Text>{userDetail.phone || 'N/A'}</Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card size="small" title="Hệ thống">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamOutlined style={{ color: '#722ed1' }} />
                    <Text strong>Vai trò:</Text>
                    <Tag color={getRoleColor(userDetail.role)}>
                      {userDetail.role || 'N/A'}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#fa8c16' }} />
                    <Text strong>Ngày tạo:</Text>
                    <Text>{new Date(userDetail.createdAt).toLocaleDateString('vi-VN')}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <UserOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
          <p style={{ color: '#8c8c8c', marginTop: 16 }}>Không có dữ liệu</p>
        </div>
      )}
    </Modal>
  );
};

export default ViewUserDetail;
