import React, { useState, useMemo } from 'react';
import { Table, Tag, Card, Select, Space, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const PaymentTable = ({ payments, loading }) => {
  // Filter and sort states
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchText, setSearchText] = useState('');

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    
    // Filter by status
    if (filterStatus) {
      result = result.filter(payment => payment.status === filterStatus);
    }
    
    // Search by customer name, customer ID, or description
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(payment => {
        const customerName = payment.customer_id?.profile?.fullName || payment.customer_id?.email || '';
        const customerId = payment.customer_id?._id || '';
        const description = payment.order_description || '';
        const orderId = payment.order_id || '';
        
        return (
          customerName.toLowerCase().includes(searchLower) ||
          customerId.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          orderId.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Sort by createdAt
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return result;
  }, [payments, filterStatus, sortOrder, searchText]);

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
            <div style={{ fontSize: '11px', color: '#888' }}>ID: {customer._id}</div>
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
          <Input
            placeholder="Tìm kiếm: tên, ID khách hàng, mô tả, mã đơn..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
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
            placeholder="Sắp xếp theo ngày"
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
