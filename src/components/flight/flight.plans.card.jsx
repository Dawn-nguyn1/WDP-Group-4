import React from 'react';
import { Button, Card, List, Pagination, Select, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const FlightPlansCard = ({
  plans,
  loading,
  status,
  onStatusChange,
  pagination,
  onPageChange,
  onLoadPlan,
}) => {
  return (
    <Card
      className="saved-paths-card"
      title="Flight Plans (từ BE)"
      extra={
        <Select
          value={status ?? undefined}
          onChange={onStatusChange}
          style={{ minWidth: 140 }}
          options={[
            { value: undefined, label: 'Tất cả' },
            { value: 'DRAFT', label: 'DRAFT' },
            { value: 'REJECTED', label: 'REJECTED' },
            { value: 'APPROVED', label: 'APPROVED' },
            { value: 'CANCELLED', label: 'CANCELLED' },
          ]}
          allowClear
          placeholder="Status"
        />
      }
    >
      <List
        loading={loading}
        dataSource={plans}
        locale={{ emptyText: 'Chưa có flight plan nào.' }}
        renderItem={(plan) => {
          const wpCount = Array.isArray(plan?.waypoints) ? plan.waypoints.length : 0;
          return (
            <List.Item
              key={plan._id}
              actions={[
                <Button key="load" size="small" type="primary" onClick={() => onLoadPlan?.(plan)}>
                  Load
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space wrap>
                    <Text strong>{plan._id?.slice?.(-8)?.toUpperCase?.() ?? plan._id}</Text>
                    <Tag color="blue">{plan.status}</Tag>
                    <Tag>{wpCount} wp</Tag>
                  </Space>
                }
                description={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text type="secondary">
                      Drone: {plan?.drone?.model ?? plan?.drone?.droneId ?? plan?.drone ?? 'N/A'}
                    </Text>
                    <Text type="secondary">
                      Start: {plan?.plannedStart ? dayjs(plan.plannedStart).format('DD/MM/YYYY HH:mm') : 'N/A'} · End:{' '}
                      {plan?.plannedEnd ? dayjs(plan.plannedEnd).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />

      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <Pagination
            size="small"
            current={pagination.currentPage || 1}
            pageSize={pagination.limit || 10}
            total={pagination.totalCount || 0}
            onChange={(page, pageSize) => onPageChange?.(page, pageSize)}
            showSizeChanger
          />
        </div>
      )}
    </Card>
  );
};

export default FlightPlansCard;

