import React, { useState, useEffect } from "react";
import { Form, Select, InputNumber, Switch, Button, Card, Modal, Tag } from "antd";
import { PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  startSimulation,
  stopSimulation,
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
  isSimulationActive = false
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);
  const isStarting = useSelector(selectIsStarting);
  const isStopping = useSelector(selectIsStopping);

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

  return (
    <Card title="Simulation Configuration" bordered={false} className="mb-4 shadow-sm">
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultValues}
        onFinish={onStart}
        disabled={isRunning || isStoppingState || isStarting || isStopping}
      >
        {/* Mission Select and Status */}
        <div className="flex justify-between items-center mb-4" style={{ gap: '16px' }}>
          <div className="flex-1">
            <Form.Item label="Select Mission" required>
              <Select
                showSearch
                placeholder="Choose a mission to simulate"
                loading={missionsLoading}
                value={selectedMissionId}
                onChange={onMissionChange}
                disabled={isSimulationActive}
                filterOption={(input, option) =>
                  (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {missions?.map(m => (
                  <Option key={m._id} value={m._id}>
                    {m.name} ({m.status})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <div className="flex items-end">
            <Form.Item label="Current Status">
              {currentRun ? (
                <Tag color={currentRun.status === 'RUNNING' ? 'green' : currentRun.status === 'STOPPING' ? 'orange' : currentRun.status === 'FAILED' ? 'red' : 'blue'}>
                  {currentRun.status}
                </Tag>
              ) : (
                <Tag color="default">No Active Run</Tag>
              )}
            </Form.Item>
          </div>
        </div>
        <Form.Item name="mode" label="Mode" tooltip="Select simulation scenario">
          <Select>
            <Option value="normal">Normal Flight</Option>
            <Option value="deviation">Deviation (Drone goes off path)</Option>
            <Option value="battery-drop">Battery Drop (Drone loses battery quickly)</Option>
          </Select>
        </Form.Item>

        <Form.Item name="timeScale" label="Time Scale" tooltip="Multiplier for speed (e.g. 10 = 10x faster)">
          <InputNumber min={0.1} max={100} step={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="tickMs" label="Tick Interval (ms)" tooltip="How often the simulation updates">
          <InputNumber min={100} max={5000} step={100} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="skipSafetyCheck" label="Skip Safety Check" valuePropName="checked" tooltip="Bypass pre-flight 4D collision check">
          <Switch />
        </Form.Item>

        <div className="flex justify-between mt-4">
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlayCircleOutlined />}
            loading={isStarting}
            disabled={!currentMission || isRunning || isStoppingState}
            className="w-1/2 mr-2"
          >
            Start Simulation
          </Button>
        </div>
      </Form>

      <div className="flex justify-between mt-4">
        <Button
          danger
          icon={<StopOutlined />}
          loading={isStopping || isStoppingState}
          disabled={!isRunning && !isStoppingState}
          className="w-1/2 ml-2"
          block
          onClick={showStopModal}
        >
          Stop Simulation
        </Button>
      </div>

      <Modal
        title="Stop Simulation"
        open={isStopModalVisible}
        onOk={onStop}
        onCancel={() => setIsStopModalVisible(false)}
        okText="Yes, Stop"
        cancelText="No"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to stop the running simulation?</p>
      </Modal>
    </Card>
  );
};

export default SimulationControl;
