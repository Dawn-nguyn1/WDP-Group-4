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
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getFlightPlanDetail,
  deleteFlightPlan,
  selectCurrentFlightPlan,
  selectFlightPlansLoading,
  clearCurrentPlan,
} from "../slices/flightPlanSlice";
import FlightPlanMapWithZones from "../components/FlightPlanMapDetail";

const { Title, Text } = Typography;
const { confirm } = Modal;

const FlightPlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const flightPlan = useSelector(selectCurrentFlightPlan);
  const loading = useSelector(selectFlightPlansLoading);

  useEffect(() => {
    if (id) {
      dispatch(getFlightPlanDetail(id));
    }
    return () => {
      dispatch(clearCurrentPlan());
    };
  }, [dispatch, id]);

  const handleDelete = () => {
    confirm({
      title: "Xóa Kế Hoạch Bay",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác. Bạn chắc chứ?",
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch(deleteFlightPlan(id)).unwrap();
          message.success("Đã xóa kế hoạch bay");
          navigate("/operator/flight-plans");
        } catch (err) {
          message.error("Lỗi khi xóa kế hoạch bay");
        }
      },
    });
  };

  if (loading && !flightPlan) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!flightPlan) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Text type="secondary">Không tìm thấy thông tin kế hoạch bay</Text>
      </div>
    );
  }

  const { status, drone, waypoints, notes, _id, pilot, priority, conflictStatus, createdAt, updatedAt } =
    flightPlan;

  const isDraft = status === "DRAFT";
  const isRejected = status === "REJECTED";
  const isApproved = status === "APPROVED";

  const getStatusColor = (s) =>
    ({
      DRAFT: "default",
      APPROVED: "success",
      REJECTED: "error",
    })[s] || "processing";

  const getConflictStatusColor = (s) =>
    ({
      CLEAR: "success",
      WARNING: "warning",
      CONFLICT: "error",
    })[s] || "default";

  const centerPosition =
    waypoints?.length > 0 ?
      [waypoints[0].latitude, waypoints[0].longitude]
    : [10.8231, 106.6297];

  const polylinePositions =
    waypoints?.map((wp) => [wp.latitude, wp.longitude]) || [];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/operator/flight-plans")}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Chi tiết Kế Hoạch Bay
        </Title>
        <Space>
          {(isDraft || isRejected) && (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/operator/flight-plans/${id}/edit`)}
              >
                Sửa
              </Button>
            </>
          )}
          {(isDraft || isRejected) && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Xóa
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã Kế Hoạch">
            <Text code>{_id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng Thái">
            <Badge status={getStatusColor(status)} text={status} />
          </Descriptions.Item>
          <Descriptions.Item label="Phi Công">
            <Text strong>{pilot?.profile?.fullName || "N/A"}</Text> - {pilot?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Drone Sử Dụng">
            <Text strong>{drone?.model || "N/A"}</Text> - {drone?.serialNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Độ Ưu Tiên">
            <Badge count={priority} style={{ backgroundColor: priority > 0 ? '#52c41a' : '#d9d9d9' }} />
          </Descriptions.Item>
          <Descriptions.Item label="Trạng Thái Xung Đột">
            <Badge status={getConflictStatusColor(conflictStatus)} text={conflictStatus} />
          </Descriptions.Item>
          <Descriptions.Item label="Số Lượng Waypoints">
            {waypoints?.length || 0} điểm
          </Descriptions.Item>
          <Descriptions.Item label="Ngày Tạo">
            {createdAt ? new Date(createdAt).toLocaleString('vi-VN') : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi Chú" span={2}>
            {notes || "Không có"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Drone Details Card */}
      <Card title="Thông Tin Drone" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Drone ID">
            <Text code>{drone?.droneId || "N/A"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số Seri">
            <Text code>{drone?.serialNumber || "N/A"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Model">
            {drone?.model || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Bản đồ Waypoints & Vùng Cấm Bay" style={{ marginTop: 24 }}>
        <FlightPlanMapWithZones 
          waypoints={waypoints}
          centerPosition={centerPosition}
        />
      </Card>
    </div>
  );
};

export default FlightPlanDetailPage;
