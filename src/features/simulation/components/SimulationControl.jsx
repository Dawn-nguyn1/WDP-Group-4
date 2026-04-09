import React, { useState, useEffect } from "react";
import { Form, Select, InputNumber, Switch, Button, Modal, Tag } from "antd";
import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import { notification } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { selectSimulationError } from "../slices/simulationSlice";
import {
  startSimulation,
  stopSimulation,
  clearError,
  selectIsStarting,
  selectIsStopping,
} from "../slices/simulationSlice";

const { Option } = Select;

const SimulationControl = ({
  currentMission,
  currentRun,
  missions = [],
  missionsLoading = false,
  selectedMissionId,
  onMissionChange,
  isSimulationActive = false,
  isOpen = false,
  onClose = () => {}
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const isStarting = useSelector(selectIsStarting);
  const isStopping = useSelector(selectIsStopping);
  const error = useSelector(selectSimulationError);
  const [prevError, setPrevError] = useState(null);

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      setPrevError(null);
    }
  }, [isOpen, dispatch]);

  // Show error notification when error changes
  useEffect(() => {
    if (error && error !== prevError && isOpen) {
      const message = typeof error === 'string' ? error : error?.message || 'Unknown error';
      
      if (error?.details?.unavailableDrones) {
        // Show detailed notification for drone unavailable errors
        notification.error({
          message: 'Simulation Start Failed',
          description: (
            <div style={{ maxWidth: 500 }}>
              <div style={{ marginBottom: 8 }}>{message}</div>
              <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                <strong>{error.details.unavailableDrones.length} drone không khả dụng:</strong>
              </div>
              {error.details.unavailableDrones.map((drone, index) => (
                <div key={index} style={{ 
                  background: '#fff2f0', 
                  padding: 6, 
                  borderRadius: 4, 
                  marginBottom: 4,
                  fontSize: 11,
                  border: '1px solid #ffccc7'
                }}>
                  <div><strong>🚁 {drone.droneCode}</strong></div>
                  <div>📍 Trạng thái: {drone.status}</div>
                  <div>⚠️ {drone.reason}</div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
                💡 Vui lòng đợi drone hoàn thành chuyến bay hiện tại hoặc dừng simulation đang chạy.
              </div>
            </div>
          ),
          duration: 8, // 8 seconds
          placement: 'topRight'
        });
      } else {
        // Show simple notification for other errors
        notification.error({
          message: 'Simulation Start Failed',
          description: message,
          duration: 5,
          placement: 'topRight'
        });
      }
      
      setPrevError(error);
    }
  }, [error, prevError, isOpen, dispatch]);

  // default parameters as requested
  const defaultValues = {
    mode: "normal",
    timeScale: 1,
    tickMs: 1000,
    skipSafetyCheck: false,
  };

  const isRunning = currentRun?.status === "RUNNING";
  const isStoppingState = currentRun?.status === "STOPPING";
  const isCompleted = currentRun?.status === "COMPLETED";

  const onStart = async (values) => {
    if (!currentMission) return;
    await dispatch(startSimulation({ missionId: currentMission._id, options: values }));
  };

  const onStop = async () => {
    if (!currentRun?.runId) return;
    await dispatch(stopSimulation(currentRun.runId));
    setIsStopModalVisible(false);
  };

  const showStopModal = () => {
    if (!isRunning && !isStoppingState) return;
    setIsStopModalVisible(true);
  };

  const handleStart = async (values) => {
    if (!currentMission) return;
    await dispatch(startSimulation({ missionId: currentMission._id, options: values }));
    // Keep modal open to show status, user can close manually
  };

  return (
    <>
      {/* Main Configuration Modal - Width reduced to 1/3 (approx 400px) */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Simulation Configuration</span>
            {currentRun && (
              <Tag color={currentRun.status === 'RUNNING' ? 'green' : currentRun.status === 'STOPPING' ? 'orange' : currentRun.status === 'FAILED' ? 'red' : 'blue'}>
                {currentRun.status}
              </Tag>
            )}
          </div>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={400}
        centered
        destroyOnClose={false}
        maskClosable={!isRunning && !isStoppingState}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={defaultValues}
          onFinish={handleStart}
          disabled={isRunning || isStoppingState || isStarting || isStopping}
          className="mt-4"
        >
          {/* Mission Select */}
          <Form.Item label="Select Mission" required>
            <Select
              showSearch
              placeholder="Choose a mission..."
              loading={missionsLoading}
              value={selectedMissionId}
              onChange={onMissionChange}
              disabled={isSimulationActive}
              filterOption={(input, option) =>
                (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
            >
              {missions?.map(m => (
                <Option key={m._id} value={m._id}>
                  {m.name} ({m.status})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Mode */}
          <Form.Item name="mode" label="Mode" tooltip="Select simulation scenario">
            <Select style={{ width: '100%' }}>
              <Option value="normal">Normal Flight</Option>
              <Option value="deviation">Deviation Test</Option>
              <Option value="battery-drop">Battery Drop</Option>
            </Select>
          </Form.Item>

          {/* Parameters - 2 columns layout */}
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="timeScale" label="Time Scale" tooltip="Speed multiplier">
              <InputNumber min={0.1} max={100} step={1} style={{ width: "100%" }} suffix="x" />
            </Form.Item>

            <Form.Item name="tickMs" label="Tick (ms)" tooltip="Update interval">
              <InputNumber min={100} max={5000} step={100} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          {/* Safety Check */}
          <Form.Item name="skipSafetyCheck" valuePropName="checked" className="mb-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Switch size="small" disabled={isRunning || isStoppingState || isStarting || isStopping} />
              <span className="text-sm text-gray-600">Skip Safety Check</span>
            </div>
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-2 border-t">
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlayCircleOutlined />}
              loading={isStarting}
              disabled={!currentMission || isRunning || isStoppingState}
              className="flex-1"
              style={{
                background: !currentMission || isRunning || isStoppingState ? undefined : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
              }}
            >
              {isStarting ? 'Starting...' : 'Start'}
            </Button>

            <Button
              danger
              icon={<StopOutlined />}
              loading={isStopping || isStoppingState}
              disabled={!isRunning && !isStoppingState}
              className="flex-1"
              onClick={showStopModal}
            >
              {isStopping || isStoppingState ? 'Stopping...' : 'Stop'}
            </Button>
          </div>


          {/* Close button */}
          <div className="mt-3">
            <Button onClick={onClose} block>
              Close
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Stop Confirmation Modal */}
      <Modal
        title="Stop Simulation"
        open={isStopModalVisible}
        onOk={onStop}
        onCancel={() => setIsStopModalVisible(false)}
        okText="Yes, Stop"
        cancelText="No"
        okButtonProps={{ danger: true }}
        width={360}
        centered
      >
        <p>Are you sure you want to stop the running simulation?</p>
      </Modal>
    </>
  );
};

export default SimulationControl;
