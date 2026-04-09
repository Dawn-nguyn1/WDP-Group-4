import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { RocketOutlined, TeamOutlined, TruckOutlined, EyeOutlined } from '@ant-design/icons';
import DroneDetailModal from './DroneDetailModal';

const DroneStatsCard = ({ droneAnalytics, loading }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const totalDrones = droneAnalytics?.totalDrones || 0;
  const individualDrones = droneAnalytics?.byOwnerType?.INDIVIDUAL || 0;
  const fleetDrones = droneAnalytics?.byOwnerType?.FLEET || 0;

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Card 
        title="Thống kê Drone" 
        loading={loading}
        extra={
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={handleOpenModal}
          >
            Xem chi tiết
          </Button>
        }
      >
        <Row gutter={16} justify="center" align="middle">
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng Drone"
              value={totalDrones}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic
              title="INDIVIDUAL"
              value={individualDrones}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Statistic
              title="FLEET"
              value={fleetDrones}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
      </Card>

      <DroneDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        droneAnalytics={droneAnalytics}
        loading={loading}
      />
    </>
  );
};

export default DroneStatsCard;
