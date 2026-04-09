import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  message,
  InputNumber,
  Modal,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined, RocketOutlined, WarningOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDrones, selectDronesList } from "../../drones/slices/droneSlice";
import { 
  validatePathAgainstZones, 
  validatePathAgainstOtherPlans 
} from "../utils/collisionUtils";
import {
  createFlightPlan,
  updateFlightPlan,
  getFlightPlanDetail,
  selectCurrentFlightPlan,
  clearCurrentPlan,
} from "../slices/flightPlanSlice";
import WaypointEditorWithZones from "./WaypointEditorWithZones";
import * as turf from "@turf/turf";

const { Option } = Select;

const FlightPlanForm = ({ initialValues = null, editingId = null }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const actualEditingId =
    editingId === true || editingId === "true" ? id : editingId;

  const drones = useSelector(selectDronesList);
  const currentPlan = useSelector(selectCurrentFlightPlan);
  const [loading, setLoading] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState(1);
  const [batteryPercentageUsed, setBatteryPercentageUsed] = useState(100);
  const [estimatedFlightTime, setEstimatedFlightTime] = useState(1);
  const [loadedData, setLoadedData] = useState({ zones: [], flightPlans: [] });

  // Flight estimation calculation using the provided formula
  const flightEstimates = useMemo(() => {
    if (waypoints.length < 2) return { time: 0, battery: 0, distance: 0 };

    let totalTimeSeconds = 0;
    let distance = 0;

    for (let i = 1; i < waypoints.length; i++) {
      const prevWp = waypoints[i - 1];
      const currWp = waypoints[i];

      const fromPoint = turf.point([prevWp.longitude, prevWp.latitude]);
      const toPoint = turf.point([currWp.longitude, currWp.latitude]);
      const horizontalDist = turf.distance(fromPoint, toPoint, { units: 'kilometers' }) * 1000;
      
      const verticalDist = Math.abs(currWp.altitude - prevWp.altitude);

      const segmentDistance = Math.sqrt(Math.pow(horizontalDist, 2) + Math.pow(verticalDist, 2));

      const speed = currWp.speed > 0 ? currWp.speed : 22;

      totalTimeSeconds += segmentDistance / speed;
      distance += horizontalDist;
    }

    totalTimeSeconds += 30; // Add 30 seconds for takeoff/landing

    const timeMinutes = Math.ceil(totalTimeSeconds / 60);

    const MAX_DRONE_FLIGHT_TIME = 30; // 30 minutes max flight time
    const batteryPercent = Math.ceil((timeMinutes / MAX_DRONE_FLIGHT_TIME) * 100);

    return {
      time: timeMinutes,
      battery: batteryPercent,
      distance: distance
    };
  }, [waypoints]);

  // Auto-update battery and time fields when waypoints change
  useEffect(() => {
    if (flightEstimates.time > 0) {
      setBatteryPercentageUsed(flightEstimates.battery);
      setEstimatedFlightTime(flightEstimates.time);
    }
  }, [flightEstimates]);

  useEffect(() => { dispatch(fetchDrones()); }, [dispatch]);

  useEffect(() => {
    if (actualEditingId && !initialValues) {
      dispatch(getFlightPlanDetail(actualEditingId));
    }
    return () => { if (!initialValues) dispatch(clearCurrentPlan()); };
  }, [dispatch, actualEditingId, initialValues]);

  const effectiveInitialValues =
    initialValues || (actualEditingId ? currentPlan : null);

  useEffect(() => {
    if (effectiveInitialValues) {
      form.setFieldsValue({
        drone: effectiveInitialValues.drone?._id || effectiveInitialValues.drone,
      });
      setNotes(effectiveInitialValues.notes || "");
      setPriority(effectiveInitialValues.priority ?? 1);  // ← đọc đúng field top-level
      setBatteryPercentageUsed(effectiveInitialValues.batteryPercentageUsed ?? 100);
      setEstimatedFlightTime(effectiveInitialValues.estimatedFlightTime ?? 1);
      if (effectiveInitialValues.waypoints) {
        setWaypoints(effectiveInitialValues.waypoints);
      }
    }
  }, [effectiveInitialValues, form]);

  useEffect(() => {
    if (effectiveInitialValues) {
      form.setFieldsValue({
        drone: effectiveInitialValues.drone?._id || effectiveInitialValues.drone,
      });
      setNotes(effectiveInitialValues.notes || "");
      setPriority(effectiveInitialValues.priority ?? 1);
      setBatteryPercentageUsed(effectiveInitialValues.batteryPercentageUsed ?? 100);
      setEstimatedFlightTime(effectiveInitialValues.estimatedFlightTime ?? 1);
      if (effectiveInitialValues.waypoints) {
        setWaypoints(effectiveInitialValues.waypoints);
      }
    }
  }, [effectiveInitialValues, form]);

  const handleSubmit = async () => {
    try {
      // 1. Validate Drone selection
      const selectedDroneId = form.getFieldValue("drone");
      if (!selectedDroneId) {
        message.error("Vui lòng chọn drone để tạo kế hoạch bay!");
        return;
      }
      
      const selectedDrone = drones.find((d) => d._id === selectedDroneId);
      if (!selectedDrone) {
        message.error("Drone được chọn không tồn tại!");
        return;
      }
      
      // 2. Validate Drone status
      if (selectedDrone.status !== "IDLE") {
        message.error(`Drone đang ở trạng thái ${selectedDrone.status}. Chỉ drone ở trạng thái IDLE mới có thể tạo kế hoạch bay.`);
        return;
      }
      
      // 3. Validate Waypoints
      if (waypoints.length < 2) {
        message.error("Kế hoạch bay phải có ít nhất 2 waypoints (TAKEOFF và LAND).");
        return;
      }
      
      const takeoff = waypoints.find((w) => w.action === "TAKEOFF");
      const land = waypoints.find((w) => w.action === "LAND");
      
      if (!takeoff) {
        message.error("Kế hoạch bay phải có ít nhất 1 waypoint với action TAKEOFF.");
        return;
      }
      
      if (!land) {
        message.error("Kế hoạch bay phải có ít nhất 1 waypoint với action LAND.");
        return;
      }
      
      // 4. Validate Waypoint sequence numbers
      const sequenceNumbers = waypoints.map(w => w.sequenceNumber);
      const uniqueSequences = [...new Set(sequenceNumbers)];
      if (sequenceNumbers.length !== uniqueSequences.length) {
        message.error("Waypoint sequence numbers phải là duy nhất!");
        return;
      }
      
      // 5. Validate Waypoint coordinates
      const invalidCoords = waypoints.find(wp => 
        !wp.latitude || !wp.longitude || 
        wp.latitude < -90 || wp.latitude > 90 ||
        wp.longitude < -180 || wp.longitude > 180
      );
      if (invalidCoords) {
        message.error(`Waypoint #${invalidCoords.sequenceNumber}: tọa độ không hợp lệ!`);
        return;
      }
      
      // 6. Validate Altitude
      const invalidAltitude = waypoints.find(wp => 
        !wp.altitude || wp.altitude <= 0 || wp.altitude > 20000
      );
      if (invalidAltitude) {
        message.error(`Waypoint #${invalidAltitude.sequenceNumber}: altitude phải > 0 và ≤ 20000m!`);
        return;
      }
      
      // 7. Validate altitude against drone maxAltitude
      const invalidMaxAltitude = waypoints.find(wp => wp.altitude > selectedDrone.maxAltitude);
      if (invalidMaxAltitude) {
        message.error(`Waypoint #${invalidMaxAltitude.sequenceNumber}: altitude ${invalidMaxAltitude.altitude} exceeds drone maxAltitude ${selectedDrone.maxAltitude}.`);
        return;
      }
      
      // 8. Validate Priority
      if (!priority || priority < 0 || priority > 10) {
        message.error("Ưu tiên phải từ 0 đến 10!");
        return;
      }
      
      // 9. Validate Battery Percentage
      if (batteryPercentageUsed === null || batteryPercentageUsed === undefined || 
          batteryPercentageUsed < 0 || batteryPercentageUsed > 100) {
        message.error("Pin dự kiến sử dụng phải từ 0% đến 100%!");
        return;
      }
      
      // 10. Validate Estimated Flight Time
      if (!estimatedFlightTime || estimatedFlightTime <= 0 || estimatedFlightTime > 1440) {
        message.error("Thời gian bay dự kiến phải > 0 phút và ≤ 1440 phút (24 giờ)!");
        return;
      }
      
      // 11. Validate Waypoint actions
      const validActions = ["TAKEOFF", "WAYPOINT", "HOVER", "LAND"];
      const invalidAction = waypoints.find(wp => !validActions.includes(wp.action));
      if (invalidAction) {
        message.error(`Waypoint #${invalidAction.sequenceNumber}: action "${invalidAction.action}" không hợp lệ!`);
        return;
      }
      
      // 11.5. NEW: GEOMETRIC COLLISION VALIDATION
      // Check against zones
      const zoneConflicts = validatePathAgainstZones(waypoints, loadedData.zones);
      const blockingConflicts = zoneConflicts.filter(c => c.type === 'BLOCKING');
      const warningConflictsForZones = zoneConflicts.filter(c => c.type === 'WARNING');

      if (blockingConflicts.length > 0) {
        Modal.error({
          title: 'KHÔNG THỂ TẠO KẾ HOẠCH BAY',
          content: (
            <div>
              <p>Đường bay của bạn vi phạm các vùng cấm (No-Fly Zones):</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {blockingConflicts.map((c, i) => (
                  <li key={i} style={{ color: '#ff4d4f', fontWeight: '500', marginBottom: '4px' }}>
                    • {c.message}
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: '12px', fontStyle: 'italic', color: '#666' }}>Vui lòng điều chỉnh tọa độ hoặc độ cao của các waypoint để tránh các vùng này.</p>
            </div>
          ),
          width: 500,
        });
        return;
      }

      // Check against other flight plans
      // Exclude current plan from comparison if editing
      const otherPlansToCompare = loadedData.flightPlans.filter(p => p._id !== actualEditingId);
      const collisionWarnings = validatePathAgainstOtherPlans(waypoints, otherPlansToCompare);

      const allWarnings = [...warningConflictsForZones, ...collisionWarnings];

      if (allWarnings.length > 0) {
        const proceed = await new Promise((resolve) => {
          Modal.confirm({
            title: 'CẢNH BÁO ĐỤNG ĐỘ / HẠN CHẾ BAY',
            icon: <WarningOutlined style={{ color: '#faad14' }} />,
            content: (
              <div>
                <p>Kế hoạch bay của bạn có một số cảnh báo sau:</p>
                <ul style={{ paddingLeft: '20px', marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {allWarnings.map((c, i) => (
                    <li key={i} style={{ color: '#faad14', marginBottom: '6px' }}>
                      • {c.message}
                    </li>
                  ))}
                </ul>
                <p style={{ marginTop: '15px', fontWeight: '600' }}>Bạn có chắc chắn muốn tiếp tục lưu kế hoạch bay này không?</p>
              </div>
            ),
            okText: 'Vẫn tiếp tục',
            cancelText: 'Quay lại chỉnh sửa',
            okButtonProps: { danger: true },
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
            width: 500,
          });
        });

        if (!proceed) return;
      }
      
      
      // 12. Final validation - all required fields present
      const payload = {
        drone: selectedDroneId,
        notes: notes || "",
        priority: priority,
        waypoints: waypoints,
        batteryPercentageUsed: batteryPercentageUsed,
        estimatedFlightTime: estimatedFlightTime,
      };
      
      // Log payload for debugging
      console.log('🚀 [FlightPlanForm] Submitting payload:', payload);
      
      setLoading(true);
      
      if (actualEditingId) {
        await dispatch(updateFlightPlan({ id: actualEditingId, data: payload }));
        message.success("Cập nhật kế hoạch bay thành công!");
      } else {
        await dispatch(createFlightPlan(payload));
        message.success("Tạo kế hoạch bay thành công!");
      }
      navigate("/operator/flight-plans");
    } catch (error) {
      message.error(error?.message || "Lỗi khi lưu kế hoạch bay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        .fp-root {
          font-family: 'DM Sans', sans-serif;
          background: #f5f6f8;
          min-height: 100vh;
          padding: 0;
        }

        /* ── Top header bar ── */
        .fp-topbar {
          background: #ffffff;
          border-bottom: 1px solid #e8eaed;
          padding: 0 32px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .fp-topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .fp-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .fp-back-btn:hover { background: #f3f4f6; color: #111827; }

        .fp-divider-v {
          width: 1px;
          height: 20px;
          background: #e5e7eb;
        }

        .fp-page-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fp-title-badge {
          font-size: 11px;
          font-weight: 600;
          background: #eff6ff;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .fp-save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1d4ed8;
          color: white;
          border: none;
          padding: 9px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(29,78,216,0.3);
        }
        .fp-save-btn:hover { background: #1e40af; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(29,78,216,0.35); }
        .fp-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Body ── */
        .fp-body {
          padding: 28px 32px;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Section label ── */
        .fp-section-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 1.2px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .fp-required { color: #ef4444; }

        .fp-ant-select .ant-select-selector {
          border-radius: 8px !important;
          border-color: #d1d5db !important;
          height: 38px !important;
          font-size: 13px !important;
        }
        .fp-ant-select .ant-select-selector:hover { border-color: #2563eb !important; }

        .fp-notes-textarea {
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          resize: vertical;
          padding: 8px 12px;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.15s;
          outline: none;
          color: #111827;
        }
        .fp-notes-textarea:hover { border-color: #2563eb; }
        .fp-notes-textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .fp-notes-textarea::placeholder { color: #9ca3af; }

        /* ── Config panel ── */
        .fp-config-panel {
          background: #ffffff;
          border: 1px solid #e8eaed;
          border-radius: 12px;
          padding: 22px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .fp-config-row {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .fp-config-col {
          flex: 1;
        }

        .fp-config-col-drone {
          flex: 0 0 280px;
        }

        .fp-config-col-notes {
          flex: 1;
        }

        .fp-field-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ── Map panel ── */
        .fp-map-panel {
          background: #ffffff;
          border: 1px solid #e8eaed;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .fp-map-header {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f1f3;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .fp-map-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fp-map-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0.1); }
        }

        .fp-map-body {
          flex: 1;
        }

        /* Override AntD form */
        .fp-root .ant-form-item { margin-bottom: 0; }
        .fp-root .ant-select-selector { height: 38px !important; align-items: center; }
        .fp-root .ant-form-item-explain-error { font-size: 11.5px; margin-top: 4px; }
      `}</style>

      <div className="fp-root">
        {/* Top navigation bar */}
        <div className="fp-topbar">
          <div className="fp-topbar-left">
            <button className="fp-back-btn" onClick={() => navigate("/operator/flight-plans")}>
              <ArrowLeftOutlined style={{ fontSize: 12 }} />
              Quay lại
            </button>
            <div className="fp-divider-v" />
            <h1 className="fp-page-title">
              <RocketOutlined style={{ fontSize: 14, color: "#2563eb" }} />
              {actualEditingId ? "Cập Nhật Kế Hoạch Bay" : "Tạo Mới Kế Hoạch Bay"}
              <span className="fp-title-badge">
                {actualEditingId ? "Edit" : "New"}
              </span>
            </h1>
          </div>
          <button
            className="fp-save-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            <SaveOutlined style={{ fontSize: 13 }} />
            {loading ? "Đang lưu..." : (actualEditingId ? "Cập Nhật" : "Tạo Kế Hoạch")}
          </button>
        </div>

        {/* Body */}
        <div className="fp-body">
          <div>
            <div className="fp-section-label">Thông tin chuyến bay</div>
            <div className="fp-config-panel">
              <Form form={form} layout="vertical">
                <div className="fp-config-row">
                  <div className="fp-config-col-drone">
                    <Form.Item
                      name="drone"
                      rules={[{ required: true, message: "Vui lòng chọn Drone" }]}
                    >
                      <div>
                        <div className="fp-field-label">
                          Drone <span className="fp-required">*</span>
                        </div>
                        <Select
                          placeholder="-- Chọn Drone --"
                          style={{ width: "100%" }}
                          size="large"
                          onChange={(value) => {
                            form.setFieldsValue({ drone: value });
                          }}
                        >
                          {drones.map((drone) => (
                            <Option key={drone._id} value={drone._id}>
                              {drone.model} · {drone.serialNumber}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </Form.Item>
                  </div>
                  <div className="fp-config-col-notes">
                    <Form.Item name="notes">
                      <div>
                        <div className="fp-field-label">Ghi chú</div>
                        <textarea
                          className="fp-notes-textarea"
                          rows={2}
                          placeholder="Nhập mục đích hoặc ghi chú thêm cho chuyến bay..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </Form.Item>
                  </div>
                </div>
                <div className="fp-config-row" style={{ marginTop: 16 }}>
                  <div className="fp-config-col-drone">
                    <Form.Item>
                      <div>
                        <div className="fp-field-label">
                          Pin dự kiến sử dụng (%)
                        </div>
                        <InputNumber
                          min={0}
                          max={100}
                          value={flightEstimates.battery || 0}
                          readOnly
                          style={{ width: "100%", backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                          size="large"
                          placeholder="0"
                          addonAfter="%"
                        />
                      </div>
                    </Form.Item>
                  </div>
                  <div className="fp-config-col-notes">
                    <Form.Item>
                      <div>
                        <div className="fp-field-label">
                          Thời gian bay dự kiến (phút)
                        </div>
                        <InputNumber
                          min={1}
                          value={flightEstimates.time || 0}
                          readOnly
                          style={{ width: "100%", backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                          size="large"
                          placeholder="0"
                          addonAfter="phút"
                        />
                      </div>
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          <div>
            <div className="fp-section-label">Bên do & Waypoints</div>
            
            {/* Flight Estimation Summary */}
            {waypoints.length >= 2 && (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#0ea5e9',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#0c4a6e' }}>
                    Thông tin estimation chuyến bay:
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Thời gian:</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', fontFamily: 'Space Mono, monospace' }}>
                      {flightEstimates.time} phút
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Pin:</span>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      color: flightEstimates.battery > 80 ? '#059669' : flightEstimates.battery > 50 ? '#d97706' : '#dc2626',
                      fontFamily: 'Space Mono, monospace' 
                    }}>
                      {flightEstimates.battery}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Quãng đường:</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', fontFamily: 'Space Mono, monospace' }}>
                      {(flightEstimates.distance / 1000).toFixed(1)} km
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="fp-map-panel">
              <div className="fp-map-header">
                <div className="fp-map-title">
                  <div className="fp-map-dot" />
                  Biên tập tuyến đường bay
                </div>
              </div>
              <div className="fp-map-body">
                <WaypointEditorWithZones
                  waypoints={waypoints}
                  setWaypoints={setWaypoints}
                  batteryPercentage={flightEstimates.battery}
                  onDataLoaded={(data) => setLoadedData(prev => ({ ...prev, ...data }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightPlanForm;