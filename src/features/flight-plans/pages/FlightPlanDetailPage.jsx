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

  const { status, drone, waypoints, notes } =
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
          <Descriptions.Item label="Trạng Thái Hô Sơ">
            <Badge status={getStatusColor(status)} text={status} />
          </Descriptions.Item>
          <Descriptions.Item label="Drone Sử Dụng">
            <Text strong>{drone?.model || "N/A"}</Text> - {drone?.serialNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Số Lượng Waypoints">
            {waypoints?.length || 0} điểm
          </Descriptions.Item>
          <Descriptions.Item label="Ghi Chú">
            {notes || "Không có"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

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
