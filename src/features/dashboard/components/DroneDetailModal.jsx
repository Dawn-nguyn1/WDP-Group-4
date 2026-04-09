import React, { useState, useMemo } from 'react';
import { Modal, Table, Tag, Select, Empty, Row, Col } from 'antd';
import { RocketOutlined, TeamOutlined, TruckOutlined } from '@ant-design/icons';

const { Option } = Select;

const DroneDetailModal = ({ visible, onClose, droneAnalytics, loading }) => {
  const [filterRole, setFilterRole] = useState('ALL');

  const drones = droneAnalytics?.drones || [];

  const filteredDrones = useMemo(() => {
    if (filterRole === 'ALL') return drones;
    return drones.filter(drone => drone.ownerType === filterRole);
  }, [drones, filterRole]);

  const columns = [
    {
      title: 'Drone ID',
      dataIndex: 'droneId',
      key: 'droneId',
      ellipsis: true,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Serial',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
    },
    {
      title: 'Owner Type',
      dataIndex: 'ownerType',
      key: 'ownerType',
      render: (ownerType) => {
        const color = ownerType === 'INDIVIDUAL' ? 'green' : 'orange';
        const icon = ownerType === 'INDIVIDUAL' ? <TeamOutlined /> : <TruckOutlined />;
        return (
          <Tag color={color} icon={icon}>
            {ownerType}
          </Tag>
        );
      },
      filters: [
        { text: 'INDIVIDUAL', value: 'INDIVIDUAL' },
        { text: 'FLEET', value: 'FLEET' },
      ],
      onFilter: (value, record) => record.ownerType === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'IDLE': 'blue',
          'FLYING': 'green',
          'MAINTENANCE': 'orange',
          'OFFLINE': 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Chủ sở hữu',
      key: 'owner',
      render: (_, record) => {
        if (!record.owner) return <Tag>Chưa có</Tag>;
        return (
          <div>
            <div>{record.owner.fullName}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.owner.email}</div>
          </div>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  const totalCount = drones.length;
  const individualCount = drones.filter(d => d.ownerType === 'INDIVIDUAL').length;
  const fleetCount = drones.filter(d => d.ownerType === 'FLEET').length;

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RocketOutlined style={{ color: '#1890ff' }} />
          Chi tiết Drone
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      styles={{ body: { paddingTop: 16 } }}
    >
      {/* Filter and Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            Lọc theo Role:
          </div>
          <Select
            value={filterRole}
            onChange={setFilterRole}
            style={{ width: '100%' }}
          >
            <Option value="ALL">Tất cả ({totalCount})</Option>
            <Option value="INDIVIDUAL">INDIVIDUAL ({individualCount})</Option>
            <Option value="FLEET">FLEET ({fleetCount})</Option>
          </Select>
        </Col>
        <Col span={6}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Tổng Drone</div>
            <div style={{ ...statValStyle, color: '#1890ff' }}>{filteredDrones.length}</div>
          </div>
        </Col>
        <Col span={6}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>INDIVIDUAL</div>
            <div style={{ ...statValStyle, color: '#52c41a' }}>
              {filteredDrones.filter(d => d.ownerType === 'INDIVIDUAL').length}
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>FLEET</div>
            <div style={{ ...statValStyle, color: '#fa8c16' }}>
              {filteredDrones.filter(d => d.ownerType === 'FLEET').length}
            </div>
          </div>
        </Col>
      </Row>

      {filteredDrones.length === 0 ? (
        <Empty description="Không có dữ liệu drone" style={{ padding: '32px 0' }} />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredDrones}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          size="small"
          scroll={{ x: 800 }}
        />
      )}
    </Modal>
  );
};

const statCardStyle = {
  background: '#f5f5f5',
  borderRadius: 8,
  padding: '12px 14px',
  textAlign: 'center',
};

const statLabelStyle = {
  fontSize: 12,
  color: '#8c8c8c',
  marginBottom: 4,
};

const statValStyle = {
  fontSize: 20,
  fontWeight: 600,
};

export default DroneDetailModal;
