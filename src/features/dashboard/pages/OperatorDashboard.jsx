import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { RocketOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const OperatorDashboard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Operator Dashboard</Title>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Drone đang hoạt động"
              value={3}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Vùng bay"
              value={12}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Kế hoạch bay"
              value={5}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Chào mừng Operator!">
        <p>Đây là trang tổng quan cho Fleet Operator.</p>
        <p>Sử dụng menu bên trái để truy cập các chức năng:</p>
        <ul>
          <li>Quản lý drone</li>
          <li>Xem vùng bay</li>
          <li>Lập kế hoạch bay</li>
          <li>Quản lý mission</li>
        </ul>
      </Card>
    </div>
  );
};

export default OperatorDashboard;
