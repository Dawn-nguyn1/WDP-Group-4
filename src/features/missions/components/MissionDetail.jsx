import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Descriptions,
  Badge,
  Button,
  Space,
  Typography,
  Spin,
  Modal,
  message,
  Table,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import {
  getMissionDetail,
  deleteMission,
  selectCurrentMission,
  selectMissionsLoading,
  clearCurrentMission,
} from "../slices/missionSlice";
import MissionUpdateModal from "./MissionUpdateModal";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mission = useSelector(selectCurrentMission);
  const loading = useSelector(selectMissionsLoading);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

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

  const handleUpdateSuccess = () => {
    // Refresh mission detail after update
    dispatch(getMissionDetail(id));
  };

  const handleEdit = () => {
    setUpdateModalVisible(true);
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

  const getPlanStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "processing";
      case "IN_PROGRESS":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const missionPlanColumns = [
    {
      title: "Flight Plan",
      dataIndex: ["flightPlan", "_id"],
      key: "flightPlan",
      render: (flightPlanId, record) => (
        <div>
          <Text strong>{flightPlanId?.slice(-8) || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Drone: {record.flightPlan?.drone?.model || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Drone",
      dataIndex: ["flightPlan", "drone", "serialNumber"],
      key: "drone",
      render: (serialNumber, record) => (
        <div>
          <Text strong>{serialNumber || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.flightPlan?.drone?.model || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Thời gian thực hiện",
      key: "time",
      render: (_, record) => (
        <div>
          <div>
            <Text strong>Bắt đầu:</Text>{" "}
            {record.plannedStart
              ? dayjs(record.plannedStart).format("DD/MM/YYYY HH:mm")
              : "N/A"}
          </div>
          <div>
            <Text strong>Kết thúc:</Text>{" "}
            {record.plannedEnd
              ? dayjs(record.plannedEnd).format("DD/MM/YYYY HH:mm")
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getPlanStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      render: (order) => <Text strong>#{order}</Text>,
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải thông tin mission..." />
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Text type="secondary">Không tìm thấy thông tin mission</Text>
      </div>
    );
  }

  const { mission: missionData, missionPlans } = mission;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/operator/missions")}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết Mission
          </Title>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            Chỉnh sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalVisible(true)}
          >
            Xóa
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên Mission">
            <Text strong>{missionData?.name || "N/A"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Badge status={getStatusColor(missionData?.status)} text={missionData?.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {missionData?.description || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            <div>
              <Text strong>{missionData?.createdBy?.profile?.fullName || "N/A"}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {missionData?.createdBy?.email || "N/A"}
              </Text>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {missionData?.createdAt
              ? dayjs(missionData.createdAt).format("DD/MM/YYYY HH:mm")
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ScheduleOutlined />
            <span>Danh sách Mission Plans ({missionPlans?.length || 0})</span>
          </div>
        }
      >
        <Table
          columns={missionPlanColumns}
          dataSource={missionPlans || []}
          rowKey="_id"
          pagination={false}
          locale={{
            emptyText: "Chưa có mission plans nào được gán cho mission này",
          }}
        />
      </Card>

      <Modal
        title="Xóa Mission"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <ExclamationCircleOutlined style={{ fontSize: "48px", color: "#ff4d4f", marginBottom: "16px" }} />
          <p>Bạn có chắc muốn xóa mission này?</p>
          <p style={{ color: "#ff4d4f" }}>
            Hành động này không thể hoàn tác và sẽ xóa tất cả mission plans liên quan.
          </p>
        </div>
      </Modal>

      {/* Update Mission Modal */}
      <MissionUpdateModal
        visible={updateModalVisible}
        missionId={id}
        onClose={() => setUpdateModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default MissionDetail;
