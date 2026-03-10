import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Descriptions,
  Badge,
  Button,
  Typography,
  Spin,
  Alert,
  Form,
  Select,
  Input,
  message,
} from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  getConflictDetail,
  resolveConflict,
  selectCurrentConflict,
  selectConflictsLoading,
  clearCurrentConflict,
} from "../slices/conflictSlice";
import dayjs from "dayjs";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
const { Option } = Select;

const ConflictDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const conflict = useSelector(selectCurrentConflict);
  const loading = useSelector(selectConflictsLoading);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getConflictDetail(id));
    }
    return () => {
      dispatch(clearCurrentConflict());
    };
  }, [dispatch, id]);

  const handleResolve = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await dispatch(resolveConflict({ id, payload: values })).unwrap();
      message.success("Đã ghi nhận phương án giải quyết!");
    } catch (err) {
      message.error(err.message || "Không thể phê duyệt xung đột.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !conflict)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  if (!conflict)
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Text type="secondary">Không tìm thấy xung đột</Text>
      </div>
    );

  const {
    status,
    severity,
    flightPlans,
    location,
    detectionMethod,
    predictedCollisionTime,
  } = conflict;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/conflicts")}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      {status === "ACTIVE" && (
        <Alert
          message="Yêu Cầu Giải Quyết Xung Đột"
          description="Phát hiện va chạm tiềm ẩn. Admin vui lòng xem xét và giải quyết."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {status === "RESOLVED" && (
        <Alert
          message="Xung Đột Đã Được Giải Quyết"
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Chi Tiết Xung Đột
          </Title>
        }
        style={{ marginBottom: 24 }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Trạng Thái">
            <Badge
              status={status === "ACTIVE" ? "error" : "success"}
              text={status}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Mức Độ (Severity)">
            <Text type={severity === "HIGH" ? "danger" : "warning"} strong>
              {severity}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Thời Gian Dự Kiến Va Chạm">
            {predictedCollisionTime ?
              dayjs(predictedCollisionTime).format("DD/MM/YYYY HH:mm:ss")
            : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Cách Thức Phát Hiện">
            {detectionMethod}
          </Descriptions.Item>
          <Descriptions.Item label="Khoảng Cách Nhang">
            {conflict.horizontalDistance} m
          </Descriptions.Item>
          <Descriptions.Item label="Khoảng Cách Dọc">
            {conflict.verticalDistance} m
          </Descriptions.Item>
          <Descriptions.Item label="Flight Plans Liên Quan" span={2}>
            {flightPlans?.map((fp) => fp._id || fp).join(", ")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {location?.coordinates && (
        <Card title="Phân tích Vị trí" style={{ marginBottom: 24 }}>
          <div
            style={{ height: "300px", borderRadius: "8px", overflow: "hidden" }}
          >
            <MapContainer
              center={[location.coordinates[1], location.coordinates[0]]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[location.coordinates[1], location.coordinates[0]]}
              >
                <Popup>
                  Điểm Xung Đột
                  <br />
                  Độ cao: {conflict.altitude}m
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </Card>
      )}

      {status !== "RESOLVED" && (
        <Card title="Phương Án Kỹ Thuật (Admin)">
          <Form form={form} layout="vertical">
            <Form.Item
              name="resolution"
              label="Quyết định"
              rules={[{ required: true }]}
            >
              <Select placeholder="-- Lựa Chọn --">
                <Option value="MANUAL_REJECT">
                  Từ chối vĩnh viễn (Manual Reject)
                </Option>
                <Option value="APPROVED_WITH_CONDITIONS">
                  Cấp phép kèm điều kiện
                </Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="notes"
              label="Ghi chú phân tích / Chỉ thị điều hướng"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleResolve}
              loading={submitting}
            >
              Xác Nhận Giải Quyết
            </Button>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ConflictDetailPage;
