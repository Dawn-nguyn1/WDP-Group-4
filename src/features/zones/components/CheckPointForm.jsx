import React, { useState } from "react";
import {
  Card,
  Form,
  InputNumber,
  Button,
  Typography,
  Alert,
  Space,
} from "antd";
import { checkPointAPI } from "../services/zoneApi";

const { Title, Text } = Typography;

const CheckPointForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form] = Form.useForm();

  const handleCheck = async (values) => {
    setLoading(true);
    setResult(null);
    try {
      const { lat, lng, altitude } = values;
      const response = await checkPointAPI(lat, lng, altitude);
      setResult({ type: "success", data: response });
    } catch (error) {
      setResult({
        type: "error",
        message:
          error.response?.data?.message || "Failed to check point coordinates.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<Title level={4}>Check Location Spatial Status</Title>}>
      <Text type="secondary" style={{ display: "block", marginBottom: "16px" }}>
        Enter coordinates to check if a point lies within any active No-Fly or
        Restricted zones.
      </Text>

      <Form
        form={form}
        layout="inline"
        onFinish={handleCheck}
        style={{ marginBottom: "24px" }}
      >
        <Form.Item
          name="lat"
          rules={[{ required: true, message: "Latitude is required" }]}
        >
          <InputNumber placeholder="Latitude" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item
          name="lng"
          rules={[{ required: true, message: "Longitude is required" }]}
        >
          <InputNumber placeholder="Longitude" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item
          name="altitude"
          rules={[{ required: true, message: "Altitude is required" }]}
        >
          <InputNumber placeholder="Altitude (m)" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Check Coordinate
          </Button>
        </Form.Item>
      </Form>

      {result?.type === "error" && (
        <Alert
          type="error"
          message="Error"
          description={result.message}
          showIcon
        />
      )}

      {result?.type === "success" && (
        <Alert
          type={
            result.data.status === "no_fly" ? "error"
            : result.data.status === "restricted" ?
              "warning"
            : "success"
          }
          message={result.data.message}
          description={
            result.data.zones?.length > 0 ?
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {result.data.zones.map((zone) => (
                  <li key={zone.id}>
                    <strong>{zone.name}</strong> ({zone.type}) - Alt:{" "}
                    {zone.minAltitude}m to {zone.maxAltitude}m
                  </li>
                ))}
              </ul>
            : "Safe to fly: Point does not intersect with any active zones."
          }
          showIcon
        />
      )}
    </Card>
  );
};

export default CheckPointForm;
