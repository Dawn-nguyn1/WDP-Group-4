import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Space } from "antd";
import { useDispatch } from "react-redux";
import { createMission } from "../slices/missionSlice";

const { Title } = Typography;
const { TextArea } = Input;

const MissionForm = ({ onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Always set status to DRAFT when creating
      const missionData = { ...values, status: "DRAFT" };
      await dispatch(createMission(missionData)).unwrap();
      message.success("Tạo mission thành công!");
      form.resetFields();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      message.error(error?.message || "Tạo mission thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Tên Mission"
          rules={[{ required: true, message: "Vui lòng nhập tên mission" }]}
        >
          <Input placeholder="Nhập tên mission" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết về mission"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo Mission
            </Button>
            <Button onClick={onClose}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    
  );
};

export default MissionForm;
