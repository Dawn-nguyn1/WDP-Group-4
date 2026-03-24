import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { DollarCircleOutlined, ShoppingCartOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';

const DashboardStats = ({ payments, revenue, loading }) => {
  const totalRevenue = revenue.monthly.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalTransactions = revenue.monthly.reduce((sum, item) => sum + item.transactionCount, 0);
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
  const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng Doanh thu"
            value={totalRevenue}
            prefix={<DollarCircleOutlined />}
            suffix="VND"
            loading={loading}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng Giao dịch"
            value={totalTransactions}
            prefix={<ShoppingCartOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Đang chờ"
            value={pendingPayments}
            prefix={<UserOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Hoàn thành"
            value={completedPayments}
            prefix={<RiseOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats;
