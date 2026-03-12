import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchDrones, selectDronesList } from "../../drones/slices/droneSlice";
import {
  createFlightPlan,
  updateFlightPlan,
  getFlightPlanDetail,
  selectCurrentFlightPlan,
  clearCurrentPlan,
} from "../slices/flightPlanSlice";
import WaypointEditorWithZones from "./WaypointEditorWithZones";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FlightPlanForm = ({ initialValues = null, editingId = null }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  // Resolve actual editing ID (router might pass editingId={true})
  const actualEditingId =
    editingId === true || editingId === "true" ? id : editingId;

  const drones = useSelector(selectDronesList);
  const currentPlan = useSelector(selectCurrentFlightPlan);
  const [loading, setLoading] = useState(false);

  // States for Waypoint Editor
  const [waypoints, setWaypoints] = useState([]);

  useEffect(() => {
    dispatch(fetchDrones());
  }, [dispatch]);

  // Fetch Flight Plan details when editing
  useEffect(() => {
    if (actualEditingId && !initialValues) {
      dispatch(getFlightPlanDetail(actualEditingId));
    }
    return () => {
      if (!initialValues) {
        dispatch(clearCurrentPlan());
      }
    };
  }, [dispatch, actualEditingId, initialValues]);

  // Set initial values from props or Redux state
  const effectiveInitialValues =
    initialValues || (actualEditingId ? currentPlan : null);

  useEffect(() => {
    if (effectiveInitialValues) {
      form.setFieldsValue({
        drone:
          effectiveInitialValues.drone?._id || effectiveInitialValues.drone,
        timeRange: [
          effectiveInitialValues.plannedStart ?
            dayjs(effectiveInitialValues.plannedStart)
          : null,
          effectiveInitialValues.plannedEnd ?
            dayjs(effectiveInitialValues.plannedEnd)
          : null,
        ],
        notes: effectiveInitialValues.notes,
      });
      if (effectiveInitialValues.waypoints) {
        setWaypoints(effectiveInitialValues.waypoints);
      }
    }
  }, [effectiveInitialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (waypoints.length < 2) {
        message.error(
          "Kế hoạch bay phải có ít nhất 2 waypoints (TAKEOFF và LAND).",
        );
        return;
      }

      const takeoff = waypoints.find((w) => w.action === "TAKEOFF");
      const land = waypoints.find((w) => w.action === "LAND");
      if (!takeoff || !land) {
        message.warning("Nên có ít nhất 1 lệnh TAKEOFF và 1 lệnh LAND.");
      }

      setLoading(true);

      const payload = {
        drone: values.drone,
        plannedStart: values.timeRange[0].format(),
        plannedEnd: values.timeRange[1].format(),
        priority: 1, // Default based on doc
        notes: values.notes,
        waypoints: waypoints,
      };

      if (actualEditingId) {
        await dispatch(
          updateFlightPlan({ id: actualEditingId, data: payload }),
        ).unwrap();
        message.success("Cập nhật kế hoạch bay thành công!");
      } else {
        await dispatch(createFlightPlan(payload)).unwrap();
        message.success("Tạo kế hoạch bay (DRAFT) thành công!");
      }

      navigate("/operator/flight-plans");
    } catch (error) {
      message.error(error.message || "Đã xảy ra lỗi khi lưu kế hoạch bay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/operator/flight-plans")}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            {actualEditingId ? "Cập Nhật Kế Hoạch Bay" : "Tạo Mới Kế Hoạch Bay"}
          </Title>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
          >
            Lưu Kế Hoạch (DRAFT)
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="drone"
                label="Chọn Drone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn Drone thực hiện bay",
                  },
                ]}
              >
                <Select
                  placeholder="-- Chọn Drone --"
                  loading={drones.length === 0}
                >
                  {drones.map((drone) => (
                    <Option key={drone._id} value={drone._id}>
                      {drone.model} - {drone.serialNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="timeRange"
                label="Thời gian dự kiến (Cất cánh - Hạ cánh)"
                rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
              >
                <RangePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea
              rows={2}
              placeholder="Nhập mục đích hoặc ghi chú thêm cho chuyến bay"
            />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24 }}>
          <Title level={5}>Biên tập Waypoints</Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Click lên bản đồ để thêm điểm Waypoint. Kéo thả marker để di chuyển.
          </Text>
          <WaypointEditorWithZones waypoints={waypoints} setWaypoints={setWaypoints} />
        </div>
      </Card>
    </div>
  );
};

export default FlightPlanForm;
