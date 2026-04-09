import React, { useState, useMemo } from 'react';
import { Table, Tag, Card, Select, Space } from 'antd';

const { Option } = Select;

const PaymentTable = ({ payments, loading }) => {
  // Filter and sort states
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    
    // Filter by status
    if (filterStatus) {
      result = result.filter(payment => payment.status === filterStatus);
    }
    
    // Sort by createdAt
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return result;
  }, [payments, filterStatus, sortOrder]);

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_id',
      key: 'customer_id',
      render: (customer) => {
        if (!customer) return <Tag color="default">Không xác định</Tag>;
        const name = customer.profile?.fullName || customer.email || 'N/A';
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>ID: {customer._id?.slice(-6)}</div>
          </div>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'order_description',
      key: 'order_description',
    },
    {
      title: 'Số tiền',
      dataIndex: 'order_amount',
      key: 'order_amount',
      render: (amount) => `${amount.toLocaleString()} VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'SUCCESS' || status === 'COMPLETED' ? 'green' : status === 'PENDING' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <Card 
      title="Lịch sử Thanh toán"
      extra={
        <Space>
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 150 }}
            value={filterStatus || undefined}
            onChange={setFilterStatus}
          >
            <Option value="SUCCESS">Thành công</Option>
            <Option value="PENDING">Đang xử lý</Option>
            <Option value="FAILED">Thất bại</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
          </Select>
          <Select
            placeholder="Sắp xếp ngày"
            style={{ width: 140 }}
            value={sortOrder}
            onChange={setSortOrder}
          >
            <Option value="desc">Mới nhất</Option>
            <Option value="asc">Cũ nhất</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredPayments}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </Card>
  );
};

export default PaymentTable;
