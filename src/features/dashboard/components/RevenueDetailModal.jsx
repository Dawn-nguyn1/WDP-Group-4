import React, { useState } from 'react';
import { Modal, Table, Tag, Statistic, Row, Col, Empty, Select } from 'antd';
import { CalendarOutlined, BarChartOutlined } from '@ant-design/icons';

const { Option } = Select;

const RevenueDetailModal = ({ visible, onClose, type, revenue }) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const isMonthly = type === 'monthly';

  const title = isMonthly
    ? `Chi tiết tháng ${selectedMonth}/${selectedYear}`
    : `Chi tiết năm ${selectedYear}`;

  // For monthly view: show daily breakdown of selected month
  const monthlyData = (revenue.daily || []).filter((item) => {
    return item._id.month === selectedMonth && item._id.year === selectedYear;
  });

  // For yearly view: show monthly breakdown of selected year
  const yearlyData = (revenue.monthly || []).filter((item) => {
    return item._id.year === selectedYear;
  });

  const totalRevenue = isMonthly
    ? monthlyData.reduce((sum, i) => sum + i.totalRevenue, 0)
    : yearlyData.reduce((sum, i) => sum + i.totalRevenue, 0);

  const totalTx = isMonthly
    ? monthlyData.reduce((sum, i) => sum + i.transactionCount, 0)
    : yearlyData.reduce((sum, i) => sum + i.transactionCount, 0);

  const dailyColumns = [
    {
      title: 'Ngày',
      dataIndex: '_id',
      key: 'day',
      render: (d) => `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`,
      sorter: (a, b) => a._id.day - b._id.day,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'revenue',
      render: (v) => (
        <span style={{ fontWeight: 500, color: '#3B6D11' }}>
          {v.toLocaleString('vi-VN')} VND
        </span>
      ),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: 'Số GD',
      dataIndex: 'transactionCount',
      key: 'tx',
      render: (v) => <Tag color="blue">{v} GD</Tag>,
    },
    {
      title: 'Trung bình/GD',
      key: 'avg',
      render: (_, record) =>
        record.transactionCount > 0
          ? `${Math.round(record.totalRevenue / record.transactionCount).toLocaleString('vi-VN')} VND`
          : '—',
    },
  ];

  const monthlyColumns = [
    {
      title: 'Tháng',
      dataIndex: '_id',
      key: 'month',
      render: (d) => (
        <Tag color="blue">
          Tháng {d.month}/{d.year}
        </Tag>
      ),
      sorter: (a, b) => a._id.month - b._id.month,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'revenue',
      render: (v) => (
        <span style={{ fontWeight: 500, color: '#3B6D11' }}>
          {v.toLocaleString('vi-VN')} VND
        </span>
      ),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: 'Số GD',
      dataIndex: 'transactionCount',
      key: 'tx',
      render: (v) => <Tag color="blue">{v} GD</Tag>,
    },
    {
      title: 'Trung bình/GD',
      key: 'avg',
      render: (_, record) =>
        record.transactionCount > 0
          ? `${Math.round(record.totalRevenue / record.transactionCount).toLocaleString('vi-VN')} VND`
          : '—',
    },
  ];

  const dataSource = isMonthly ? monthlyData : yearlyData;
  const columns = isMonthly ? dailyColumns : monthlyColumns;

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMonthly ? (
            <CalendarOutlined style={{ color: '#185FA5' }} />
          ) : (
            <BarChartOutlined style={{ color: '#3B6D11' }} />
          )}
          {title}
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={680}
      styles={{ body: { paddingTop: 16 } }}
    >
      {/* Date selectors */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={isMonthly ? 12 : 24}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            Chọn năm:
          </div>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: '100%' }}
            size="small"
          >
            {[2024, 2025, 2026, 2027, 2028].map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Col>
        {isMonthly && (
          <Col span={12}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
              Chọn tháng:
            </div>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: '100%' }}
              size="small"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                <Option key={month} value={month}>
                  Tháng {month}
                </Option>
              ))}
            </Select>
          </Col>
        )}
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Tổng doanh thu</div>
            <div style={{ ...statValStyle, color: '#3B6D11' }}>
              {totalRevenue.toLocaleString('vi-VN')} VND
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Tổng giao dịch</div>
            <div style={{ ...statValStyle, color: '#185FA5' }}>{totalTx} GD</div>
          </div>
        </Col>
        <Col span={8}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Trung bình/GD</div>
            <div style={{ ...statValStyle, color: '#534AB7' }}>
              {totalTx > 0
                ? `${Math.round(totalRevenue / totalTx).toLocaleString('vi-VN')} VND`
                : '—'}
            </div>
          </div>
        </Col>
      </Row>

      {dataSource.length === 0 ? (
        <Empty description="Không có dữ liệu" style={{ padding: '32px 0' }} />
      ) : (
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={(r) =>
            isMonthly
              ? `${r._id.year}-${r._id.month}-${r._id.day}`
              : `${r._id.year}-${r._id.month}`
          }
          pagination={dataSource.length > 10 ? { pageSize: 10 } : false}
          size="small"
          bordered={false}
        />
      )}
    </Modal>
  );
};

const statCardStyle = {
  background: '#f5f5f5',
  borderRadius: 8,
  padding: '12px 14px',
};
const statLabelStyle = {
  fontSize: 12,
  color: '#8c8c8c',
  marginBottom: 4,
};
const statValStyle = {
  fontSize: 16,
  fontWeight: 500,
};

export default RevenueDetailModal;