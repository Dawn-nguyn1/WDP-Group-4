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
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrones, selectDronesList } from "../../drones/slices/droneSlice";
import {
  createFlightPlan,
  updateFlightPlan,
  selectCurrentFlightPlan,
  clearCurrentPlan,
} from "../slices/flightPlanSlice";
import FlightPlansMap from "../components/FlightPlansMap";

const { Title, Text } = Typography;
const { Option } = Select;

const FlightPlansPage = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const drones = useSelector(selectDronesList);
  const currentPlan = useSelector(selectCurrentFlightPlan);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDrones());
  }, [dispatch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        drone: values.drone,
        notes: values.notes,
      };

      await dispatch(createFlightPlan(payload));
      message.success("Tạo kế hoạch bay thành công!");

      // Reset form và navigate đến trang danh sách
      form.resetFields();
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
      <div style={{ marginBottom: 24 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/operator/flight-plans")}
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách
        </Button>
        
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          <PlusOutlined /> Tạo Kế hoạch Bay Mới
        </Title>
      </div>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="Thông tin Kế hoạch Bay" style={{ height: "100%" }}>
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
                  rows={4}
                  placeholder="Nhập mục đích hoặc ghi chú thêm cho chuyến bay"
                  style={{ minHeight: 120 }}
                />
              </Form.Item>

              <div style={{ marginTop: 24, textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  size="large"
                >
                  Tạo Kế hoạch Bay
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <FlightPlansMap />
        </Col>
      </Row>
    </div>
  );
};

export default FlightPlansPage;
