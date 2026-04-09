import React, { useState } from 'react';
import { Modal, Table, Tag, Statistic, Row, Col, Empty, Select } from 'antd';
import { CalendarOutlined, BarChartOutlined } from '@ant-design/icons';

const { Option } = Select;

const RevenueDetailModal = ({ visible, onClose, type, revenue }) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentQuarter = Math.ceil(currentMonth / 3);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const isMonthly = type === 'monthly';
  const isQuarterly = type === 'quarterly';

  const title = isMonthly
    ? `Chi tiết tháng ${selectedMonth}/${selectedYear}`
    : isQuarterly
    ? `Chi tiết quý ${selectedQuarter}/${selectedYear}`
    : `Chi tiết năm ${selectedYear}`;

  // For monthly view: show monthly summary (API doesn't have daily breakdown)
  const monthlyData = (revenue.monthly || []).filter((item) => {
    return item._id.month === selectedMonth && item._id.year === selectedYear;
  });

  // For quarterly view: show monthly breakdown of selected quarter
  const startMonth = (selectedQuarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const quarterlyData = (revenue.monthly || []).filter((item) => {
    return item._id.year === selectedYear &&
           item._id.month >= startMonth &&
           item._id.month <= endMonth;
  });

  // For yearly view: show monthly breakdown of selected year
  const yearlyData = (revenue.monthly || []).filter((item) => {
    return item._id.year === selectedYear;
  });

  const totalRevenue = isMonthly
    ? monthlyData.reduce((sum, i) => sum + i.totalRevenue, 0)
    : isQuarterly
    ? quarterlyData.reduce((sum, i) => sum + i.totalRevenue, 0)
    : yearlyData.reduce((sum, i) => sum + i.totalRevenue, 0);

  const totalTx = isMonthly
    ? monthlyData.reduce((sum, i) => sum + i.transactionCount, 0)
    : isQuarterly
    ? quarterlyData.reduce((sum, i) => sum + i.transactionCount, 0)
    : yearlyData.reduce((sum, i) => sum + i.transactionCount, 0);

  const monthlySummaryColumns = [
    {
      title: 'Tháng',
      dataIndex: '_id',
      key: 'month',
      render: (d) => (
        <Tag color="blue">
          Tháng {d.month}/{d.year}
        </Tag>
      ),
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

  const quarterlyColumns = [
    {
      title: 'Quý',
      dataIndex: '_id',
      key: 'quarter',
      render: (d) => (
        <Tag color="blue">
          Quý {Math.ceil(d.month / 3)}/{d.year}
        </Tag>
      ),
      sorter: (a, b) => Math.ceil(a._id.month / 3) - Math.ceil(b._id.month / 3),
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

  const dataSource = isMonthly ? monthlyData : isQuarterly ? quarterlyData : yearlyData;
  const columns = isMonthly ? monthlySummaryColumns : isQuarterly ? quarterlyColumns : monthlyColumns;

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMonthly ? (
            <CalendarOutlined style={{ color: '#185FA5' }} />
          ) : isQuarterly ? (
            <BarChartOutlined style={{ color: '#722ed1' }} />
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
        <Col span={isMonthly || isQuarterly ? 12 : 24}>
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
        {isQuarterly && (
          <Col span={12}>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
              Chọn quý:
            </div>
            <Select
              value={selectedQuarter}
              onChange={setSelectedQuarter}
              style={{ width: '100%' }}
              size="small"
            >
              {[1, 2, 3, 4].map((quarter) => (
                <Option key={quarter} value={quarter}>
                  Quý {quarter}
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
              ? `${r._id.year}-${r._id.month}`
              : isQuarterly
              ? `${r._id.year}-${r._id.month}`
              : `${r._id.year}-${r._id.month}`
          }
          locale={{ emptyText: 'Không có dữ liệu' }}
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