import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Select, message, Space } from "antd";
import { useDispatch } from "react-redux";
import { createMission } from "../slices/missionSlice";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MissionForm = ({ onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await dispatch(createMission(values)).unwrap();
      message.success("Tạo mission thành công!");
      form.resetFields();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      message.error("Tạo mission thất bại!");
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

        <Form.Item
          name="status"
          label="Trạng thái"
          initialValue="DRAFT"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="DRAFT">Bản nháp</Option>
            <Option value="ACTIVE">Kích hoạt</Option>
            <Option value="ARCHIVED">Lưu trữ</Option>
          </Select>
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
