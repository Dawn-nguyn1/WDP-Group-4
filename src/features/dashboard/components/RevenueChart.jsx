import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';

const RevenueChart = ({ revenue, loading }) => {
  const totalRevenue = revenue.monthly.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalTransactions = revenue.monthly.reduce((sum, item) => sum + item.transactionCount, 0);

  return (
    <Card title="Thống kê Doanh thu" loading={loading}>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="Tổng Doanh thu" value={totalRevenue} suffix="VND" />
        </Col>
        <Col span={8}>
          <Statistic title="Tổng Giao dịch" value={totalTransactions} />
        </Col>
        <Col span={8}>
          <Statistic title="Trung bình/GD" value={totalTransactions ? Math.round(totalRevenue / totalTransactions) : 0} suffix="VND" />
        </Col>
      </Row>
    </Card>
  );
};

export default RevenueChart;
