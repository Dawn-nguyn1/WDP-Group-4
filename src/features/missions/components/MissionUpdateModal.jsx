import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, message, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { updateMission, getMissionDetail } from '../slices/missionSlice';

const { TextArea } = Input;
const { Option } = Select;

const MissionUpdateModal = ({ visible, missionId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [missionData, setMissionData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible && missionId) {
      // Fetch mission detail when modal opens
      fetchMissionDetail();
    } else {
      // Reset form and data when modal closes
      form.resetFields();
      setMissionData(null);
    }
  }, [visible, missionId, form]);

  const fetchMissionDetail = async () => {
    try {
      setFetchLoading(true);
      const response = await dispatch(getMissionDetail(missionId)).unwrap();
      setMissionData(response.mission);
      
      // Set form values with mission data
      form.setFieldsValue({
        name: response.mission.name,
        description: response.mission.description,
        status: response.mission.status,
      });
    } catch (error) {
      message.error('Lỗi tải thông tin mission!');
      console.error('Fetch mission detail error:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await dispatch(updateMission({ id: missionId, data: values })).unwrap();
      message.success('Cập nhật mission thành công!');
      form.resetFields();
      setMissionData(null);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      message.error('Cập nhật mission thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setMissionData(null);
    if (onClose) onClose();
  };

  return (
    <Modal
      title="Cập nhật Mission"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      {fetchLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="Đang tải thông tin mission..." />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên Mission"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tên mission',
              },
            ]}
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
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn trạng thái',
              },
            ]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="DRAFT">Bản nháp</Option>
              <Option value="ACTIVE">Kích hoạt</Option>
              <Option value="ARCHIVED">Lưu trữ</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật Mission
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default MissionUpdateModal;