import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Modal, message } from "antd";
import { useDispatch } from "react-redux";
import { createDrone, updateDrone } from "../slices/droneSlice";

const { Option } = Select;

const DroneForm = ({ visible, onCancel, onSuccess, editingDrone }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingDrone) {
        form.setFieldsValue({
          serialNumber: editingDrone.serialNumber,
          model: editingDrone.model,
          maxAltitude: editingDrone.maxAltitude,
          status: editingDrone.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingDrone, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingDrone) {
        await dispatch(
          updateDrone({ id: editingDrone._id, data: values }),
        ).unwrap();
        message.success("Cập nhật drone thành công");
      } else {
        await dispatch(createDrone(values)).unwrap();
        message.success("Thêm drone thành công");
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(
        editingDrone ?
          `Lỗi cập nhật: ${error.message || "Đã có lỗi xảy ra"}`
        : `Lỗi thêm mới: ${error.message || "Đã có lỗi xảy ra"}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={editingDrone ? "Cập nhật Drone" : "Thêm Drone Mới"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="droneForm">
        <Form.Item
          name="serialNumber"
          label="Số Serial"
          rules={[
            { required: true, message: "Vui lòng nhập số serial của drone" },
          ]}
        >
          <Input placeholder="Ví dụ: SN123456" disabled={!!editingDrone} />
        </Form.Item>

        <Form.Item
          name="model"
          label="Model / Dòng máy"
          rules={[{ required: true, message: "Vui lòng nhập model của drone" }]}
        >
          <Input placeholder="Ví dụ: DJI Air 3, Phantom 4RTK" />
        </Form.Item>

        <Form.Item
          name="maxAltitude"
          label="Độ cao bay tối đa (m)"
          rules={[
            { required: true, message: "Vui lòng nhập độ cao bay tối đa" },
          ]}
        >
          <InputNumber min={1} max={10000} style={{ width: "100%" }} />
        </Form.Item>

        {editingDrone && (
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="IDLE">IDLE (Rảnh rỗi)</Option>
              <Option value="IN_FLIGHT">IN_FLIGHT (Đang bay)</Option>
              <Option value="MAINTENANCE">MAINTENANCE (Bảo trì)</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default DroneForm;
