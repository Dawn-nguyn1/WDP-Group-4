import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Select, Alert, Spin, Tag, Row, Col } from "antd";
import { 
  getSimulationStatus, 
  selectCurrentRun, 
  selectSimulationError 
} from "../slices/simulationSlice";
import { fetchMissions, selectMissionsList, selectMissionsLoading } from "../../missions/slices/missionSlice";
import SimulationControl from "../components/SimulationControl";
import SimulationLogConsole from "../components/SimulationLogConsole";
import SimulationMap from "../components/SimulationMap";
import { useSimulationTelemetry } from "../hooks/useSimulationTelemetry";

const { Content } = Layout;
const { Option } = Select;

const SimulationDashboard = () => {
  const dispatch = useDispatch();
  const currentRun = useSelector(selectCurrentRun);
  const error = useSelector(selectSimulationError);
  
  const missions = useSelector(selectMissionsList);
  const missionsLoading = useSelector(selectMissionsLoading);

  const [selectedMissionId, setSelectedMissionId] = useState(null);

  // Poll for status if a run is active
  useEffect(() => {
    let intervalId;
    if (currentRun?.runId && ["RUNNING", "STOPPING"].includes(currentRun.status)) {
      intervalId = setInterval(() => {
        dispatch(getSimulationStatus(currentRun.runId));
      }, 2000); // 2 second polling as planned
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentRun?.runId, currentRun?.status, dispatch]);

  // Try to load missions if not loaded
  useEffect(() => {
    dispatch(fetchMissions({ page: 1, limit: 100 }));
  }, [dispatch]);

  // If we recover a run, try to set the selected mission to match the run's mission
  useEffect(() => {
    if (currentRun?.missionId && !selectedMissionId) {
      setSelectedMissionId(currentRun.missionId);
    }
  }, [currentRun, selectedMissionId]);

  const handleMissionChange = (missionId) => {
    setSelectedMissionId(missionId);
  };

  const selectedMission = missions?.find(m => m._id === selectedMissionId);
  
  const isSimulationActive = currentRun && ["RUNNING", "STOPPING"].includes(currentRun.status);

  // Lắng nghe Telemetry qua WebSocket
  const token = localStorage.getItem("access_token");
  const { dronesLiveProps } = useSimulationTelemetry(currentRun, token);

  return (
    <Layout className="h-full bg-gray-50">
      <Content className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 m-0">Fleet Simulation Dashboard</h1>
          {currentRun && (
            <Tag color={currentRun.status === 'RUNNING' ? 'green' : currentRun.status === 'STOPPING' ? 'orange' : currentRun.status === 'FAILED' ? 'red' : 'blue'}>
              Status: {currentRun.status}
            </Tag>
          )}
        </div>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" closable />
        )}

        <Row gutter={24}>
          <Col xs={24} lg={8}>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h3 className="text-md font-semibold mb-2">Select Mission</h3>
              <Select
                showSearch
                placeholder="Choose a mission to simulate"
                style={{ width: "100%" }}
                loading={missionsLoading}
                value={selectedMissionId}
                onChange={handleMissionChange}
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
            </div>

            <SimulationControl 
              currentMission={selectedMission} 
              currentRun={currentRun} 
            />
          </Col>
          
          <Col xs={24} lg={16}>
             <div className="bg-white rounded-lg shadow-sm mb-4 p-2 relative overflow-hidden">
                <SimulationMap 
                  currentMission={selectedMission}
                  dronesLiveProps={dronesLiveProps}
                />
            </div>

            <SimulationLogConsole currentRun={currentRun} />
          </Col>
        </Row>

      </Content>
    </Layout>
  );
};

export default SimulationDashboard;
