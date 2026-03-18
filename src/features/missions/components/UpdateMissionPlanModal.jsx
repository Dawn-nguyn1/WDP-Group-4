import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updateMissionPlan } from '../slices/missionSlice';
import { selectCurrentMission } from '../slices/missionSlice';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const UpdateMissionPlanModal = ({ visible, missionId, missionPlanId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currentMission = useSelector(selectCurrentMission);

  useEffect(() => {
    if (visible && missionPlanId && currentMission?.missionPlans) {
      // Find the mission plan to edit
      const missionPlan = currentMission.missionPlans.find(plan => plan._id === missionPlanId);
      if (missionPlan) {
        form.setFieldsValue({
          plannedStart: dayjs(missionPlan.plannedStart),
          plannedEnd: dayjs(missionPlan.plannedEnd),
          order: missionPlan.order,
          status: missionPlan.status,
          notes: missionPlan.notes || '',
        });
      }
    }
  }, [visible, missionPlanId, currentMission, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const submitData = {
        plannedStart: values.plannedStart.toISOString(),
        plannedEnd: values.plannedEnd.toISOString(),
        order: values.order,
        status: values.status,
        notes: values.notes || '',
      };

      await dispatch(updateMissionPlan({ 
        missionId, 
        missionPlanId, 
        data: submitData 
      })).unwrap();
      
      message.success('Cập nhật Mission Plan thành công!');
      form.resetFields();
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      message.error('Cập nhật Mission Plan thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onClose) onClose();
  };

  return (
    <Modal
      title="Cập nhật Mission Plan"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="plannedStart"
          label="Thời gian bắt đầu"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn thời gian bắt đầu',
            },
          ]}
        >
          <DatePicker
            showTime
            placeholder="Chọn thời gian bắt đầu"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="plannedEnd"
          label="Thời gian kết thúc"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn thời gian kết thúc',
            },
          ]}
        >
          <DatePicker
            showTime
            placeholder="Chọn thời gian kết thúc"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="order"
          label="Thứ tự"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập thứ tự',
            },
          ]}
        >
          <Input
            type="number"
            placeholder="Nhập thứ tự thực hiện"
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn trạng thái',
            },
          ]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="SCHEDULED">Lên lịch</Option>
            <Option value="IN_PROGRESS">Đang thực hiện</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <TextArea
            rows={3}
            placeholder="Nhập ghi chú (không bắt buộc)"
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật Mission Plan
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateMissionPlanModal;
