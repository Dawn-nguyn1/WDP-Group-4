import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Alert, Tag, Button, Card, Statistic, Row, Col, notification } from "antd";
import { SettingOutlined, ThunderboltOutlined, AimOutlined, CheckCircleOutlined } from "@ant-design/icons";
import '../../users/styles/UserPage.css';
import {
  getSimulationStatus,
  getMissionSimulationStatus,
  selectCurrentRun,
  selectSimulationError,
  selectLiveDrones
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
  const liveDrones = useSelector(selectLiveDrones);

  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [detailedMission, setDetailedMission] = useState(null);
  const [missionFlightPaths, setMissionFlightPaths] = useState([]);

  // Poll for status if a run is active - use mission-based API for live drone data
  useEffect(() => {
    let intervalId;
    if (selectedMissionId && currentRun?.status && ["RUNNING", "STOPPING"].includes(currentRun.status)) {
      intervalId = setInterval(() => {
        // Use mission-based API to get live drone data including battery
        dispatch(getMissionSimulationStatus(selectedMissionId));
      }, 2000); // 2 second polling
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedMissionId, currentRun?.status, dispatch]);

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
  const [prevStatus, setPrevStatus] = useState(null);

  // Notification when simulation COMPLETED
  useEffect(() => {
    if (currentRun?.status === 'COMPLETED' && prevStatus && prevStatus !== 'COMPLETED') {
      notification.success({
        message: 'Simulation Completed',
        description: 'Mission simulation has completed successfully!',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 5,
        placement: 'topRight'
      });
    }
    setPrevStatus(currentRun?.status);
  }, [currentRun?.status, prevStatus]);

  // Lắng nghe Telemetry qua WebSocket
  const token = localStorage.getItem("access_token");
  const { dronesLiveProps } = useSimulationTelemetry(currentRun, token);

  // Calculate drone stats from WebSocket telemetry data (real-time)
  const droneStats = Object.entries(dronesLiveProps).map(([droneId, props]) => {
    // Get battery from WebSocket telemetry (from simulate-mission.js)
    let battery = null;
    if (props.batteryLevel !== undefined && props.batteryLevel !== null) {
      battery = props.batteryLevel;
    } else if (props.battery !== undefined && props.battery !== null) {
      battery = props.battery;
    } else if (props.batteryPercentage !== undefined && props.batteryPercentage !== null) {
      battery = props.batteryPercentage;
    }
    
    // Calculate distance traveled from WebSocket telemetry: total - remaining
    let distanceTraveled = 0;
    let totalDistance = 0;
    if (props.totalDistanceMeters !== undefined && props.remainingDistanceMeters !== undefined) {
      totalDistance = props.totalDistanceMeters;
      const remaining = props.remainingDistanceMeters;
      distanceTraveled = totalDistance - remaining;
    } else if (props.distanceTraveled !== undefined && props.distanceTraveled !== null) {
      distanceTraveled = props.distanceTraveled;
    } else if (props.distance !== undefined && props.distance !== null) {
      distanceTraveled = props.distance;
    }
    
    // Get progress percentage from WebSocket telemetry
    const progressPercent = props.progressPercent !== undefined 
      ? props.progressPercent 
      : (totalDistance > 0 ? Math.round((distanceTraveled / totalDistance) * 100) : 0);
    
    return {
      droneId: droneId.slice(-8), // Show last 8 chars
      fullDroneId: droneId,
      battery: battery !== null ? Math.round(battery) : null,
      distance: distanceTraveled,
      totalDistance: totalDistance,
      progressPercent: progressPercent,
      lat: props.lat,
      lng: props.lng,
      altitude: props.altitude || props.alt,
      // Additional telemetry info
      speed: props.speed,
      heading: props.heading,
      sessionId: props.sessionId
    };
  });


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

        {/* Config Button - Outside Map Container */}
        <div className="flex justify-end mb-4">
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

        {/* Drone Stats Panel - Show when simulation is active */}
        {isSimulationActive && droneStats.length > 0 && (
          <Card 
            title="Drone Telemetry" 
            size="small" 
            className="mb-4"
            style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}
          >
            <Row gutter={[16, 16]}>
              {droneStats.map((drone) => (
                <Col span={8} key={drone.fullDroneId}>
                  <Card 
                    size="small" 
                    title={`Drone ...${drone.droneId}`}
                    style={{ background: '#fff' }}
                  >
                    <div style={{ fontSize: 12, color: '#666', lineHeight: '1.8' }}>
                      <div>
                        <span style={{ color: '#1890ff' }}>🔋 Pin:</span>{' '}
                        <span style={{ 
                          color: drone.battery !== null 
                            ? (drone.battery < 20 ? '#ff4d4f' : drone.battery < 50 ? '#faad14' : '#52c41a')
                            : '#999',
                          fontWeight: 500
                        }}>
                          {drone.battery !== null ? `${drone.battery}%` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#1890ff' }}>📏 Quãng đường:</span>{' '}
                        <span style={{ fontWeight: 500 }}>
                          {(drone.distance / 1000).toFixed(2)} km
                        </span>
                        <span style={{ color: '#999', fontSize: 11 }}>
                          {' '}(Tổng: {(drone.totalDistance / 1000).toFixed(2)} km)
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#1890ff' }}>📊 Tiến độ:</span>{' '}
                        <span style={{ fontWeight: 500 }}>{drone.progressPercent}%</span>
                      </div>
                      <div>
                        <span style={{ color: '#1890ff' }}>⛰️ Alt:</span>{' '}
                        <span>{drone.altitude ? `${Math.round(drone.altitude)}m` : 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#1890ff' }}>📍 Pos:</span>{' '}
                        <span>{drone.lat?.toFixed(4)}, {drone.lng?.toFixed(4)}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-lg p-6 relative" style={{ 
          height: 'calc(100vh - 150px)', 
          minHeight: '700px',
          boxShadow: '0 25px 50px -12px rgba(162, 158, 158, 0.48)',
          border: '2px solid #d1d5db'
        }}>
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
