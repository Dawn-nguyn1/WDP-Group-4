import React, { useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

const FlightSaveModal = ({ open, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      drone: initialValues?.drone ?? '',
      plannedStart: initialValues?.plannedStart ?? dayjs(),
      plannedEnd: initialValues?.plannedEnd ?? dayjs().add(30, 'minute'),
      priority: initialValues?.priority ?? 1,
      notes: initialValues?.notes ?? '',
      defaultSpeed: initialValues?.defaultSpeed ?? 10,
    });
  }, [open, form, initialValues]);

  return (
    <Modal
      title="Lưu Flight Plan (POST /api/flight-plans)"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu"
      confirmLoading={loading}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit?.(values);
        }}
      >
        <Form.Item
          label="Drone (ObjectId)"
          name="drone"
          rules={[{ required: true, message: 'Vui lòng nhập drone ObjectId' }]}
        >
          <Input placeholder="Ví dụ: 507f1f77bcf86cd799439011" />
        </Form.Item>

        <Form.Item
          label="Thời gian bay dự kiến"
          required
          style={{ marginBottom: 8 }}
        >
          <Input.Group compact style={{ display: 'flex', gap: 8 }}>
            <Form.Item
              name="plannedStart"
              rules={[{ required: true, message: 'Chọn plannedStart' }]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="plannedEnd"
              rules={[{ required: true, message: 'Chọn plannedEnd' }]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item label="Priority" name="priority">
          <InputNumber min={0} max={10} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Default speed (m/s) cho WAYPOINT/LAND" name="defaultSpeed">
          <InputNumber min={0} max={50} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <TextArea rows={3} placeholder="Ghi chú chuyến bay" />
        </Form.Item>

        <Form.Item label="Action cho điểm trung gian" name="intermediateAction" initialValue="WAYPOINT">
          <Select
            options={[
              { value: 'WAYPOINT', label: 'WAYPOINT' },
              { value: 'HOVER', label: 'HOVER' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FlightSaveModal;

