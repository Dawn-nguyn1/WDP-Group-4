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
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getFlightPlanDetail,
  submitFlightPlan,
  cancelFlightPlan,
  deleteFlightPlan,
  selectCurrentFlightPlan,
  selectFlightPlanConflicts,
  selectFlightPlansLoading,
  clearCurrentPlan,
} from "../slices/flightPlanSlice";
import ConflictViewer from "../components/ConflictViewer";
import dayjs from "dayjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

// Fix Leaflet's default icon issue in React
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const { Title, Text } = Typography;
const { confirm } = Modal;

const FlightPlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const flightPlan = useSelector(selectCurrentFlightPlan);
  const conflicts = useSelector(selectFlightPlanConflicts);
  const loading = useSelector(selectFlightPlansLoading);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getFlightPlanDetail(id));
    }
    return () => {
      dispatch(clearCurrentPlan());
    };
  }, [dispatch, id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await dispatch(submitFlightPlan(id)).unwrap();
      message.success("Đã submit kiểm tra xung đột!");
    } catch (err) {
      message.error(err.message || "Phát hiện xung đột hoặc có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    confirm({
      title: "Hủy Kế Hoạch Bay",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn hủy kế hoạch bay này không?",
      onOk: async () => {
        try {
          await dispatch(cancelFlightPlan(id)).unwrap();
          message.success("Đã hủy kế hoạch bay");
          dispatch(getFlightPlanDetail(id));
        } catch (err) {
          message.error("Lỗi khi hủy kế hoạch bay");
        }
      },
    });
  };

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

  const { status, drone, plannedStart, plannedEnd, waypoints, notes } =
    flightPlan;

  const isDraft = status === "DRAFT";
  const isRejected = status === "REJECTED";
  const isApproved = status === "APPROVED";
  const isCancelled = status === "CANCELLED";

  const getStatusColor = (s) =>
    ({
      DRAFT: "default",
      APPROVED: "success",
      REJECTED: "error",
      CANCELLED: "warning",
    })[s] || "processing";

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
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                loading={submitting}
              >
                Submit Kiểm Tra
              </Button>
            </>
          )}
          {(isDraft || isRejected) && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Xóa
            </Button>
          )}
          {isApproved && (
            <Button danger icon={<StopOutlined />} onClick={handleCancel}>
              Hủy Chuyến
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Trạng Thái Hô Sơ">
            <Badge status={getStatusColor(status)} text={status} />
          </Descriptions.Item>
          <Descriptions.Item label="Drone Sử Dụng">
            <Text strong>{drone?.model || "N/A"}</Text> - {drone?.serialNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Thời Gian Bắt Đầu Dự Kiến">
            {plannedStart ?
              dayjs(plannedStart).format("DD/MM/YYYY HH:mm")
            : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời Gian Kết Thúc Dự Kiến">
            {plannedEnd ? dayjs(plannedEnd).format("DD/MM/YYYY HH:mm") : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Số Lượng Waypoints">
            {waypoints?.length || 0} điểm
          </Descriptions.Item>
          <Descriptions.Item label="Ghi Chú">
            {notes || "Không có"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {(conflicts?.length > 0 || isApproved) && (
        <ConflictViewer conflicts={conflicts} planStatus={status} />
      )}

      <Card title="Bản đồ Waypoints" style={{ marginTop: 24 }}>
        <div
          style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}
        >
          <MapContainer
            center={centerPosition}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {waypoints?.map((wp, index) => (
              <Marker key={index} position={[wp.latitude, wp.longitude]}>
                <Popup>
                  <strong>
                    {wp.action} (WP #{wp.sequenceNumber})
                  </strong>
                  <br />
                  Độ cao: {wp.altitude}m<br />
                  Tốc độ: {wp.speed}m/s
                </Popup>
              </Marker>
            ))}
            {polylinePositions.length > 1 && (
              <Polyline positions={polylinePositions} color="blue" />
            )}
          </MapContainer>
        </div>
      </Card>
    </div>
  );
};

export default FlightPlanDetailPage;
