import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Select,
  Row,
  Col,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrones, selectDronesList } from "../../drones/slices/droneSlice";
import {
  createFlightPlan,
  updateFlightPlan,
  getFlightPlanDetail,
  selectCurrentFlightPlan,
  clearCurrentPlan,
} from "../slices/flightPlanSlice";
import FlightPlansMap from "./FlightPlansMap";
import { checkPointAPI } from "../../zones/services/zoneApi";

const { Title, Text } = Typography;
const { Option } = Select;

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
        notes: effectiveInitialValues.notes,
      });
    }
  }, [effectiveInitialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        drone: values.drone,
        notes: values.notes,
      };

      if (actualEditingId) {
        // Update existing flight plan
        await dispatch(updateFlightPlan({ id: actualEditingId, ...payload }));
        message.success("Cập nhật kế hoạch bay thành công!");
      } else {
        // Create new flight plan
        await dispatch(createFlightPlan(payload));
        message.success("Tạo kế hoạch bay thành công!");
      }

      // Navigate back to flight plans list
      navigate("/operator/flight-plans");
    } catch (error) {
      console.error("Submit flight plan error:", error);
      message.error(error?.message || "Lỗi khi lưu kế hoạch bay");
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
            <Col span={24}>
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
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea
              rows={2}
              placeholder="Nhập mục đích hoặc ghi chú thêm cho chuyến bay"
            />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24 }}>
          <FlightPlansMap />
        </div>
      </Card>
    </div>
  );
};

export default FlightPlanForm;
