import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { Card, Descriptions, Badge, Button, Space, Typography, Spin, Modal, Tag, Table, Text } from 'antd';
import { EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import {
  getMissionDetail,
  deleteMission,
  startMission,
  selectCurrentMission,
  selectMissionsLoading,
  clearCurrentMission,
} from "../slices/missionSlice";

const MissonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mission = useSelector(selectCurrentMission);
  const loading = useSelector(selectMissionsLoading);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getMissionDetail(id));
    }

    return () => {
      dispatch(clearCurrentMission());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteMission(id)).unwrap();
      message.success("Xóa mission thành công!");
      navigate("/operator/missions");
    } catch (error) {
      message.error("Xóa mission thất bại!");
    }
  };

  const handleStartMission = async () => {
    try {
      await dispatch(startMission(id)).unwrap();
      message.success("Bắt đầu mission thành công!");
      // Refresh mission detail to get updated status
      dispatch(getMissionDetail(id));
    } catch (error) {
      message.error("Bắt đầu mission thất bại!");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "ACTIVE":
        return "processing";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const canStartMission = (missionStatus) => {
    return missionStatus === "DRAFT" || missionStatus === "CANCELLED";
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Chi tiết Mission
        </Typography.Title>
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalVisible(true)}
          >
            Xóa
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="Đang tải thông tin Mission..." />
        </div>
      ) : mission ? (
        <>
          <Card style={{ marginBottom: '24px' }}>
            <Descriptions title="Thông tin Mission" bordered column={2}>
              <Descriptions.Item label="ID">{mission.mission?._id || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Tên">{mission.mission?.name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {mission.mission?.description || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge 
                  status={getStatusColor(mission.mission?.status)} 
                  text={mission.mission?.status || 'N/A'} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên">
                <Tag color={mission.mission?.priority === 'HIGH' ? 'red' : mission.mission?.priority === 'MEDIUM' ? 'orange' : 'blue'}>
                  {mission.mission?.priority || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {mission.mission?.createdBy?.profile?.fullName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email người tạo">
                {mission.mission?.createdBy?.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {mission.mission?.createdAt ? new Date(mission.mission.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {mission.mission?.updatedAt ? new Date(mission.mission.updatedAt).toLocaleString('vi-VN') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Mission Plans" style={{ marginBottom: '24px' }}>
            {mission.missionPlans && mission.missionPlans.length > 0 ? (
              <Table
                dataSource={mission.missionPlans}
                rowKey="_id"
                pagination={false}
                columns={[
                  {
                    title: 'Flight Plan',
                    dataIndex: ['flightPlan', '_id'],
                    key: 'flightPlan',
                    render: (flightPlanId, record) => (
                      <div>
                        <Text strong>{flightPlanId?.slice(-8) || 'N/A'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Drone: {record.flightPlan?.drone?.serialNumber || 'N/A'}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'Thời gian bắt đầu',
                    dataIndex: 'plannedStart',
                    key: 'plannedStart',
                    render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
                  },
                  {
                    title: 'Thời gian kết thúc',
                    dataIndex: 'plannedEnd',
                    key: 'plannedEnd',
                    render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Badge 
                        status={getStatusColor(status)} 
                        text={status || 'N/A'} 
                      />
                    ),
                  },
                  {
                    title: 'Thứ tự',
                    dataIndex: 'order',
                    key: 'order',
                  },
                ]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">Mission này chưa có Mission Plans nào</Text>
              </div>
            )}
          </Card>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">Không tìm thấy thông tin Mission</Text>
        </div>
      )}

      <Modal
        title="Xóa Mission"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc muốn xóa Mission này?</p>
      </Modal>
    </div>
  )
}

export default MissonDetail