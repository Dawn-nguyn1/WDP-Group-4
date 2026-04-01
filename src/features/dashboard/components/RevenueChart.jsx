import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import RevenueDetailModal from './RevenueDetailModal';

const RevenueChart = ({ revenue, loading }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'monthly' | 'yearly'
  const [hoveredCard, setHoveredCard] = useState(null); // 'monthly' | 'yearly' | null

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthlyRevenue = revenue.monthly || [];
  const yearlyRevenue = revenue.yearly || [];

  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalTransactions = monthlyRevenue.reduce((sum, item) => sum + item.transactionCount, 0);

  // Current month data
  const currentMonthData = monthlyRevenue.find(
    (m) => m._id.month === currentMonth && m._id.year === currentYear
  );

  // Current year data
  const currentYearData = yearlyRevenue.find((y) => y._id.year === currentYear);

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalType(null);
  };

  return (
    <>
      <Card title="Thống kê Doanh thu Chi tiết" loading={loading}>
        {/* Tổng quan */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic
              title="Tổng Doanh thu"
              value={totalRevenue}
              suffix="VND"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tổng Giao dịch"
              value={totalTransactions}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Trung bình/GD"
              value={totalTransactions ? Math.round(totalRevenue / totalTransactions) : 0}
              suffix="VND"
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tháng này"
              value={currentMonthData?.totalRevenue || 0}
              suffix="VND"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Col>
        </Row>

        {/* Thống kê theo tháng và năm hiện tại — có thể click để xem chi tiết */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {/* Card tháng hiện tại */}
          <Col span={12}>
            <div
              onClick={() => handleOpenModal('monthly')}
              style={hoveredCard === 'monthly' ? clickableCardHoverStyle : clickableCardStyle}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setHoveredCard('monthly')}
              onMouseLeave={() => setHoveredCard(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenModal('monthly')}
              title="Xem chi tiết theo ngày trong tháng này"
            >
              <div style={cardInnerHeader}>
                <span style={cardTitleStyle}>Doanh thu theo tháng</span>
                <RightOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
              </div>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">
                  Tháng {currentMonth}/{currentYear}
                </Tag>
                <div style={{ marginTop: 6 }}>
                  <strong style={{ fontSize: 15 }}>
                    {(currentMonthData?.totalRevenue || 0).toLocaleString('vi-VN')} VND
                  </strong>
                  <span style={{ color: '#8c8c8c', marginLeft: 6, fontSize: 13 }}>
                    - {currentMonthData?.transactionCount || 0} GD
                  </span>
                </div>
              </div>
              <div style={clickHintStyle}>Nhấn để xem chi tiết theo ngày →</div>
            </div>
          </Col>

          {/* Card năm hiện tại */}
          <Col span={12}>
            <div
              onClick={() => handleOpenModal('yearly')}
              style={hoveredCard === 'yearly' ? clickableCardHoverStyle : clickableCardStyle}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setHoveredCard('yearly')}
              onMouseLeave={() => setHoveredCard(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenModal('yearly')}
              title="Xem chi tiết theo tháng trong năm này"
            >
              <div style={cardInnerHeader}>
                <span style={cardTitleStyle}>Doanh thu theo năm</span>
                <RightOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
              </div>
              <div style={{ marginTop: 8 }}>
                <Tag color="green">Năm {currentYear}</Tag>
                <div style={{ marginTop: 6 }}>
                  <strong style={{ fontSize: 15 }}>
                    {(currentYearData?.totalRevenue || 0).toLocaleString('vi-VN')} VND
                  </strong>
                  <span style={{ color: '#8c8c8c', marginLeft: 6, fontSize: 13 }}>
                    - {currentYearData?.transactionCount || 0} GD
                  </span>
                </div>
              </div>
              <div style={clickHintStyle}>Nhấn để xem chi tiết theo tháng →</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Modal chi tiết */}
      <RevenueDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        type={modalType}
        revenue={revenue}
      />
    </>
  );
};

const clickableCardStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#d9d9d9',
  borderRadius: 8,
  padding: '12px 14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  background: '#fff',
  userSelect: 'none',
  position: 'relative',
};

const clickableCardHoverStyle = {
  ...clickableCardStyle,
  borderColor: '#1890ff',
  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)',
};

// Inline hover handled via CSS class — for simplicity use onMouseEnter/Leave
const cardInnerHeader = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const cardTitleStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: '#595959',
};

const clickHintStyle = {
  marginTop: 10,
  fontSize: 11,
  color: '#bfbfbf',
};

export default RevenueChart;