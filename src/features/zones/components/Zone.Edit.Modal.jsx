import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, message, Row, Col } from 'antd';
import { updateZoneAPI, getZoneDetailAPI } from '../services/zoneApi';

const { TextArea } = Input;
const { Option } = Select;

const ZoneEditModal = ({ visible, onCancel, zoneId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [zoneData, setZoneData] = useState(null);

  // Load zone data khi modal mở
  useEffect(() => {
    if (visible && zoneId) {
      loadZoneData();
    }
  }, [visible, zoneId]);

  const loadZoneData = async () => {
    try {
      setLoading(true);
      const response = await getZoneDetailAPI(zoneId);
      setZoneData(response);
      form.setFieldsValue({
        name: response.name,
        description: response.description,
        type: response.type,
        minAltitude: response.minAltitude,
        maxAltitude: response.maxAltitude,
        effectiveFrom: response.effectiveFrom ? new Date(response.effectiveFrom).toISOString().slice(0, 16) : null,
        effectiveTo: response.effectiveTo ? new Date(response.effectiveTo).toISOString().slice(0, 16) : null,
      });
    } catch (error) {
      console.error('Load zone data error:', error);
      message.error('Không thể tải thông tin zone');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Chuẩn bị data để gửi đi - KHÔNG gửi geometry để tránh validation error
      const updateData = {
        name: values.name,
        description: values.description,
        type: values.type,
        minAltitude: values.minAltitude,
        maxAltitude: values.maxAltitude,
      };

      // Thêm effective dates nếu có
      if (values.effectiveFrom) {
        updateData.effectiveFrom = new Date(values.effectiveFrom).toISOString();
      }
      if (values.effectiveTo) {
        updateData.effectiveTo = new Date(values.effectiveTo).toISOString();
      }

      // KHÔNG gửi geometry - backend sẽ giữ nguyên geometry cũ
      // Chỉ gửi các field text/number để avoid turf validation error
      
      console.log('📝 Updating zone:', zoneId, updateData);
      
      const response = await updateZoneAPI(zoneId, updateData);
      console.log('✅ Zone updated:', response);
      
      message.success('Cập nhật zone thành công!');
      
      // Callback để refresh data
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Reset form và đóng modal
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('❌ Update zone error:', error);
      message.error(error?.message || 'Cập nhật zone thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setZoneData(null);
    onCancel();
  };

  return (
    <Modal
      title={`Chỉnh sửa Zone: ${zoneData?.name || ''}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div style={{ 
        marginBottom: 16, 
        padding: 12, 
        backgroundColor: '#fff7e6', 
        border: '1px solid #ffd591',
        borderRadius: 6
      }}>
        <div style={{ color: '#d46b08', fontSize: '14px', fontWeight: 500 }}>
          ⚠️ Lưu ý: Chỉ có thể chỉnh sửa thông tin cơ bản
        </div>
        <div style={{ color: '#d46b08', fontSize: '12px', marginTop: 4 }}>
          • Geometry (khu vực địa lý) sẽ được giữ nguyên<br/>
          • Để thay đổi geometry, vui lòng xóa và tạo zone mới
        </div>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'no_fly',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên Zone"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên zone!' },
                { min: 3, message: 'Tên zone phải có ít nhất 3 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tên zone" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Loại Zone"
              name="type"
              rules={[{ required: true, message: 'Vui lòng chọn loại zone!' }]}
            >
              <Select placeholder="Chọn loại zone">
                <Option value="no_fly">Cấm bay</Option>
                <Option value="restricted">Hạn chế</Option>
                <Option value="warning">Cảnh báo</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Nhập mô tả zone"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Độ cao tối thiểu (m)"
              name="minAltitude"
              rules={[
                { required: true, message: 'Vui lòng nhập độ cao tối thiểu!' },
                { type: 'number', min: 0, message: 'Độ cao không thể âm!' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                min={0}
                max={20000}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Độ cao tối đa (m)"
              name="maxAltitude"
              rules={[
                { required: true, message: 'Vui lòng nhập độ cao tối đa!' },
                { type: 'number', min: 0, message: 'Độ cao không thể âm!' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="5000"
                min={0}
                max={20000}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Hiệu lực từ"
              name="effectiveFrom"
            >
              <Input 
                type="datetime-local" 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Hiệu lực đến"
              name="effectiveTo"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const effectiveFrom = getFieldValue('effectiveFrom');
                    if (effectiveFrom && new Date(value) < new Date(effectiveFrom)) {
                      return Promise.reject(new Error('Hiệu lực đến phải lớn hơn hoặc bằng hiệu lực từ!'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input 
                type="datetime-local" 
                style={{ width: '100%' }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  const effectiveFrom = form.getFieldValue('effectiveFrom');
                  if (effectiveFrom && new Date(value) < new Date(effectiveFrom)) {
                    message.warning('Hiệu lực đến phải lớn hơn hoặc bằng hiệu lực từ!');
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            Cập nhật Zone
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ZoneEditModal;