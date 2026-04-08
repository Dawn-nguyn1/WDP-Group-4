import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addFlightPlanToMission, fetchMissions } from '../slices/missionSlice';
import { fetchFlightPlans } from '../../flight-plans/slices/flightPlanSlice';
import { selectMissionsList } from '../slices/missionSlice';
import { selectFlightPlansList } from '../../flight-plans/slices/flightPlanSlice';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AddFlightPlanModal = ({ visible, missionId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const missionsList = useSelector(selectMissionsList);
  const flightPlansList = useSelector(selectFlightPlansList);

  useEffect(() => {
    // Fetch flight plans when modal opens
    if (visible) {
      dispatch(fetchFlightPlans({ page: 1, limit: 100, status: "ACTIVE" }));
    }
  }, [dispatch, visible]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const submitData = {
        flightPlanId: values.flightPlanId,
        plannedStart: values.plannedStart.toISOString(),
        plannedEnd: values.plannedEnd.toISOString(),
        order: values.order,
        notes: values.notes || '',
      };

      await dispatch(addFlightPlanToMission({ 
        missionId, 
        data: submitData 
      })).unwrap();
      
      message.success('Thêm flight plan vào mission thành công!');
      form.resetFields();
      
      // Refresh mission detail
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      message.error(error?.error?.message || error?.message || 'Thêm flight plan vào mission thất bại!');
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
      title="Thêm Flight Plan vào Mission"
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
          name="flightPlanId"
          label="Flight Plan"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn flight plan',
            },
          ]}
        >
          <Select
            placeholder="Chọn Flight Plan"
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {flightPlansList?.map((flightPlan) => (
              <Option key={flightPlan._id} value={flightPlan._id}>
                {flightPlan._id.slice(-8)} - Drone: {flightPlan.drone?.model || 'N/A'}
              </Option>
            ))}
          </Select>
        </Form.Item>

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
          initialValue={1}
        >
          <Input
            type="number"
            placeholder="Nhập thứ tự thực hiện"
            min={1}
          />
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
              Thêm vào Mission
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddFlightPlanModal;
