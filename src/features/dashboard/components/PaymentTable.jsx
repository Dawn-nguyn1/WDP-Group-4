import React from 'react';
import { Table, Tag, Card } from 'antd';

const PaymentTable = ({ payments, loading }) => {
  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Customer ID',
      dataIndex: 'customer_id',
      key: 'customer_id',
      ellipsis: true,
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
    },
  ];

  return (
    <Card title="Lịch sử Thanh toán">
      <Table
        columns={columns}
        dataSource={payments}
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
