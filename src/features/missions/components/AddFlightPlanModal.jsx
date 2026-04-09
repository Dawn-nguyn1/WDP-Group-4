import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, DatePicker, message, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addFlightPlanToMission, fetchMissions } from '../slices/missionSlice';
import { fetchFlightPlans } from '../../flight-plans/slices/flightPlanSlice';
import { selectMissionsList } from '../slices/missionSlice';
import { selectFlightPlansList } from '../../flight-plans/slices/flightPlanSlice';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const { Text } = Typography;

const AddFlightPlanModal = ({ visible, missionId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedFlightPlan, setSelectedFlightPlan] = useState(null);
  const dispatch = useDispatch();
  const missionsList = useSelector(selectMissionsList);
  const flightPlansList = useSelector(selectFlightPlansList);

  // Watch for start time changes to auto-calculate end time
  const plannedStart = Form.useWatch('plannedStart', form);

  useEffect(() => {
    // Auto-calculate end time when start time changes and we have selected flight plan
    if (plannedStart && selectedFlightPlan?.estimatedFlightTime) {
      const durationMinutes = selectedFlightPlan.estimatedFlightTime;
      const endTime = plannedStart.add(durationMinutes, 'minute');
      form.setFieldValue('plannedEnd', endTime);
    }
  }, [plannedStart, selectedFlightPlan, form]);

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
            onChange={(value) => {
              // Set form value immediately
              form.setFieldValue('flightPlanId', value);
              // Update selected flight plan state
              const selected = flightPlansList?.find(fp => fp._id === value);
              setSelectedFlightPlan(selected || null);
              // If we have start time, auto-calculate end time immediately
              const currentStart = form.getFieldValue('plannedStart');
              if (currentStart && selected?.estimatedFlightTime) {
                const endTime = currentStart.add(selected.estimatedFlightTime, 'minute');
                form.setFieldValue('plannedEnd', endTime);
              }
            }}
          >
            {flightPlansList?.map((flightPlan) => (
              <Option key={flightPlan._id} value={flightPlan._id}>
                {flightPlan._id.slice(-8)} - Drone: {flightPlan.drone?.model || 'N/A'}
                {flightPlan.estimatedFlightTime && ` (${flightPlan.estimatedFlightTime} phút)`}
              </Option>
            ))}
          </Select>
          {selectedFlightPlan?.estimatedFlightTime && (
            <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
              Thời gian bay ước tính: {selectedFlightPlan.estimatedFlightTime} phút
            </Text>
          )}
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
          label="Thời gian kết thúc (tự động tính)"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn thời gian kết thúc',
            },
          ]}
        >
          <DatePicker
            showTime
            placeholder="Thời gian kết thúc (tự động tính)"
            style={{ width: '100%' }}
            disabled={!selectedFlightPlan?.estimatedFlightTime}
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
