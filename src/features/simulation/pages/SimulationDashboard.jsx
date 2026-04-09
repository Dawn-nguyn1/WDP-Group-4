import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Alert, Tag, Button } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import '../../users/styles/UserPage.css';
import {
  getSimulationStatus,
  selectCurrentRun,
  selectSimulationError
} from "../slices/simulationSlice";
import { fetchMissions, selectMissionsList, selectMissionsLoading } from "../../missions/slices/missionSlice";
import { getMissionDetailAPI } from "../../missions/services/missionApi";
import { getFlightPlanDetailAPI } from "../../flight-plans/services/flightPlanApi";
import SimulationControl from "../components/SimulationControl";
import SimulationMap from "../components/SimulationMap";
import { useSimulationTelemetry } from "../hooks/useSimulationTelemetry";

const { Content } = Layout;

const SimulationDashboard = () => {
  const dispatch = useDispatch();
  const currentRun = useSelector(selectCurrentRun);
  const error = useSelector(selectSimulationError);

  const missions = useSelector(selectMissionsList);
  const missionsLoading = useSelector(selectMissionsLoading);

  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [detailedMission, setDetailedMission] = useState(null);
  const [missionFlightPaths, setMissionFlightPaths] = useState([]);

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

  // Bước 1: Khi chọn mission, lấy chi tiết mission để có danh sách flight plan IDs
  useEffect(() => {
    const fetchMissionDetail = async () => {
      if (!selectedMissionId) {
        setDetailedMission(null);
        setMissionFlightPaths([]);
        return;
      }
      try {
        console.log(`🔍 [Step 1] Fetching detail for Mission ID: ${selectedMissionId}`);
        const res = await getMissionDetailAPI(selectedMissionId);
        console.log("✅ [Step 1] Mission Detail received:", res);
        
        // Log drone and waypoint info found in mission detail
        if (res.missionPlans && res.missionPlans.length > 0) {
          console.log(`📊 [Step 1] Found ${res.missionPlans.length} plans in mission detail:`);
          res.missionPlans.forEach((plan, idx) => {
            const fp = plan.flightPlan;
            const droneId = fp?.drone?.droneId || "N/A";
            const waypointsCount = fp?.waypoints?.length || 0;
            console.log(`   - Plan #${idx + 1}: Drone ID = ${droneId}, Waypoints = ${waypointsCount}`);
          });
        }

        setDetailedMission(res);
      } catch (err) {
        console.error("❌ [Step 1] Error fetching mission detail:", err);
      }
    };
    fetchMissionDetail();
  }, [selectedMissionId]);

  // Bước 2: Khi đã có chi tiết mission, lấy chi tiết từng flight plan để có waypoints
  useEffect(() => {
    const fetchAllFlightPlans = async () => {
      if (!detailedMission?.missionPlans) {
        console.log("ℹ️ [Step 2] No missionPlans to fetch yet or detailedMission is empty.");
        return;
      }

      try {
        console.log(`🔍 [Step 2] Found ${detailedMission.missionPlans.length} mission plans. Fetching detailed flight plans...`);
        const paths = [];
        for (const [index, plan] of detailedMission.missionPlans.entries()) {
          const flightPlanId = plan.flightPlan?._id || plan.flightPlan;
          if (flightPlanId) {
            console.log(`   - Fetching Flight Plan #${index + 1} (ID: ${flightPlanId})...`);
            const res = await getFlightPlanDetailAPI(flightPlanId);
            const fp = res.flightPlan || res;
            if (fp && fp.waypoints) {
              console.log(`     ✅ Success: Received ${fp.waypoints.length} waypoints for Flight Plan ${flightPlanId}`);
              paths.push(fp);
            } else {
              console.warn(`     ⚠️ Warning: Flight Plan ${flightPlanId} returned no waypoints!`);
            }
          } else {
            console.warn(`   ⚠️ Warning: Plan #${index} has no flightPlan ID.`);
          }
        }
        console.log("🏁 [Step 2] Finished fetching all flight plans. Total paths:", paths.length);
        setMissionFlightPaths(paths);
      } catch (err) {
        console.error("❌ [Step 2] Error fetching flight plan details:", err);
      }
    };
    fetchAllFlightPlans();
  }, [detailedMission]);


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


  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const showConfigModal = () => setIsConfigModalOpen(true);
  const hideConfigModal = () => setIsConfigModalOpen(false);

  return (
    <div className="user-page-container">
      <div className="page-header">
        <h1 className="page-title">Fleet Simulation Dashboard</h1>
        <p className="page-subtitle">Manage and monitor fleet simulations in real-time</p>
      </div>
      
      <div className="p-6">
        {error && (
          <Alert message={error} type="error" showIcon className="mb-4" closable />
        )}

        {/* Map Container with Config Button Overlay */}
        <div className="bg-white rounded-lg shadow-sm p-2 relative" style={{ height: 'calc(100vh - 140px)', minHeight: '600px' }}>
          {/* Config Button - Top Right on Map */}
          <div className="absolute top-4 right-4 z-[1000]">
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={showConfigModal}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)'
              }}
            >
              Simulation Configuration
            </Button>
          </div>

          <SimulationMap
            currentMission={detailedMission || selectedMission}
            missionFlightPaths={missionFlightPaths}
            dronesLiveProps={dronesLiveProps}
          />
        </div>

        {/* Simulation Control Modal */}
        <SimulationControl
          currentMission={selectedMission}
          currentRun={currentRun}
          missions={missions}
          missionsLoading={missionsLoading}
          selectedMissionId={selectedMissionId}
          onMissionChange={handleMissionChange}
          isSimulationActive={isSimulationActive}
          isOpen={isConfigModalOpen}
          onClose={hideConfigModal}
        />
      </div>
    </div>
  );
};

export default SimulationDashboard;
