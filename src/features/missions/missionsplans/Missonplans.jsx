import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Space, Tag, Card, Typography, Spin, message, Modal } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMissionDetail, selectCurrentMission, selectMissionsLoading, fetchMissions, selectMissionsList, startMission } from '../slices/missionSlice';
import AddFlightPlanModal from '../components/AddFlightPlanModal';
import UpdateMissionPlanModal from '../components/UpdateMissionPlanModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const MissionPlans = () => {
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [addPlanModalVisible, setAddPlanModalVisible] = useState(false);
  const [updatePlanModalVisible, setUpdatePlanModalVisible] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const missionData = useSelector(selectCurrentMission);
  const loading = useSelector(selectMissionsLoading);
  const missionsList = useSelector(selectMissionsList);

  useEffect(() => {
    dispatch(fetchMissions({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleMissionSelect = (missionId) => {
    setSelectedMissionId(missionId);
    if (missionId) {
      dispatch(getMissionDetail(missionId));
    }
  };

  const handleViewMissionDetail = (missionId) => {
    navigate(`/operator/missions/${missionId}`);
  };

  const handleViewFlightPlan = (flightPlanId) => {
    navigate(`/operator/flight-plans/${flightPlanId}`);
  };

  const handleEditMissionPlan = (missionPlanId) => {
    setEditingPlanId(missionPlanId);
    setUpdatePlanModalVisible(true);
  };

  const handleStartMission = async () => {
    try {
      await dispatch(startMission(selectedMissionId)).unwrap();
      message.success("Bắt đầu mission thành công!");
      // Refresh mission detail to get updated status
      dispatch(getMissionDetail(selectedMissionId));
    } catch (error) {
      message.error("Bắt đầu mission thất bại!");
    }
  };

  const canStartMission = (missionStatus) => {
    return missionStatus === "DRAFT" || missionStatus === "CANCELLED";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'processing';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getFlightPlanStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'ACTIVE': return 'processing';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const missionPlanColumns = [
    {
      title: 'Mission',
      dataIndex: ['mission'],
      key: 'mission',
      render: (missionId, record) => (
        <div>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewMissionDetail(missionId)}
          >
            {missionId?.slice(-8) || 'N/A'}
          </Button>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.missionName || 'Mission Name'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Flight Plan',
      dataIndex: ['flightPlan', '_id'],
      key: 'flightPlan',
      render: (flightPlanId, record) => (
        <div>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewFlightPlan(flightPlanId)}
          >
            {flightPlanId?.slice(-8) || 'N/A'}
          </Button>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Drone: {record.flightPlan?.drone?.model || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Drone',
      dataIndex: ['flightPlan', 'drone'],
      key: 'drone',
      render: (drone) => (
        <div>
          <Text strong>{drone?.serialNumber || 'N/A'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {drone?.model || 'N/A'}
          </Text>
          <br />
          <Tag size="small" color={drone?.status === 'IDLE' ? 'green' : 'orange'}>
            {drone?.status || 'N/A'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Thời gian thực hiện',
      key: 'time',
      render: (_, record) => (
        <div>
          <div><Text strong>Bắt đầu:</Text> {record.plannedStart ? dayjs(record.plannedStart).format('DD/MM/YYYY HH:mm') : 'N/A'}</div>
          <div><Text strong>Kết thúc:</Text> {record.plannedEnd ? dayjs(record.plannedEnd).format('DD/MM/YYYY HH:mm') : 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewMissionDetail(record.mission)}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditMissionPlan(record._id)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => {
                setDeletingPlanId(record._id);
                setDeleteModalVisible(true);
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<Title level={4}>Quản lý Mission Plans</Title>} style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Chọn Mission để xem danh sách kế hoạch bay:</Text>
          <Select
            placeholder="Chọn một Mission"
            style={{ width: '100%', maxWidth: '400px' }}
            onChange={handleMissionSelect}
            allowClear
            showSearch
            filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {missionsList?.map(mission => (
              <Option key={mission._id} value={mission._id}>
                {mission.name} ({mission._id.slice(-6)})
              </Option>
            ))}
          </Select>
          {selectedMissionId && (
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddPlanModalVisible(true)}
              >
                Thêm Flight Plan
              </Button>
              {canStartMission(missionData?.mission?.status) && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartMission}
                  loading={loading}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Bắt đầu Mission
                </Button>
              )}
            </Space>
          )}
        </Space>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="Đang tải Mission Plans..." />
        </div>
      ) : (
        <Table
          columns={missionPlanColumns}
          dataSource={missionData?.missionPlans || []}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: selectedMissionId 
              ? 'Mission này chưa có Mission Plans nào'
              : 'Vui lòng chọn Mission để xem Mission Plans',
          }}
        />
      )}

      <Modal
        title="Xóa Mission Plan"
        open={deleteModalVisible}
        onOk={() => {
          message.success(`Đã xóa kế hoạch ${deletingPlanId}`);
          setDeleteModalVisible(false);
        }}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc muốn xóa Mission Plan này?</p>
      </Modal>

      {/* Add Flight Plan Modal */}
      <AddFlightPlanModal
        visible={addPlanModalVisible}
        missionId={selectedMissionId}
        onClose={() => setAddPlanModalVisible(false)}
        onSuccess={() => {
          setAddPlanModalVisible(false);
          // Refresh mission detail to show new flight plan
          if (selectedMissionId) {
            dispatch(getMissionDetail(selectedMissionId));
          }
        }}
      />

      {/* Update Mission Plan Modal */}
      <UpdateMissionPlanModal
        visible={updatePlanModalVisible}
        missionId={selectedMissionId}
        missionPlanId={editingPlanId}
        onClose={() => setUpdatePlanModalVisible(false)}
        onSuccess={() => {
          setUpdatePlanModalVisible(false);
          setEditingPlanId(null);
          // Refresh mission detail to show updated flight plan
          if (selectedMissionId) {
            dispatch(getMissionDetail(selectedMissionId));
          }
        }}
      />
    </div>
  );
};

export default MissionPlans;