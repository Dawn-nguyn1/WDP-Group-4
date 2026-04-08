import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export function useSimulationTelemetry(currentRun, token) {
  const [dronesLiveProps, setDronesLiveProps] = useState({});

  useEffect(() => {
    // If no active run or missing wsUrl/token, do not connect
    if (!currentRun?.runId || !currentRun?.options?.wsUrl || !token) {
      console.log('🔌 [WS] Skipping connect - missing data:', {
        runId: currentRun?.runId,
        wsUrl: currentRun?.options?.wsUrl,
        hasToken: !!token,
        status: currentRun?.status
      });
      return;
    }

    if (!['RUNNING', 'STOPPING'].includes(currentRun.status)) {
      console.log('🔌 [WS] Skipping connect - status not active:', currentRun.status);
      return;
    }

    const { wsUrl } = currentRun.options;
    const { missionId } = currentRun;

    console.log('🔌 [WS] Attempting connection to:', wsUrl, 'for mission:', missionId);

    // Khởi tạo socket.io client - dùng polling trước (ổn định), rồi upgrade lên websocket
    const socket = io(wsUrl, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      auth: { token },
      query: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    socket.on('connect', () => {
      console.log('✅ [WS] Connected to WebSocket at:', wsUrl);
      console.log('✅ [WS] Joining watch_session with missionId:', missionId);
      socket.emit('watch_session', { contextId: missionId });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ [WS] Connection error:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Simulation Telemetry');
    });

    socket.on('telemetry', (payload) => {
      console.log('📡 [WS] Telemetry received:', payload.droneId, 'lat:', payload.lat, 'lng:', payload.lng);
      setDronesLiveProps((prev) => ({
        ...prev,
        [payload.droneId]: {
          ...prev[payload.droneId],
          ...payload,
        }
      }));
    });

    socket.on('alert', (payload) => {
      // Nhận alert để hiển thị cảnh báo đỏ trên drone
      // payload format tuỳ BE, ví dụ: { droneId, type, message }
      setDronesLiveProps((prev) => {
        const droneId = payload.droneId;
        if (!droneId) return prev;
        return {
          ...prev,
          [droneId]: {
            ...prev[droneId],
            alert: payload
          }
        };
      });
    });

    // Cleanup khi component unmount hoặc khi runId đổi
    return () => {
      socket.disconnect();
    };
  }, [currentRun?.runId, currentRun?.status, currentRun?.options?.wsUrl, currentRun?.missionId, token]);

  // Sync log output from `currentRun.logs` to check for DEVIATION locally as fallback
  // Do "ALERT DEVIATION" log is in the output stream as requested.
  useEffect(() => {
    if (!currentRun?.logs) return;

    // Check last line of log for deviation
    const deviationLogs = currentRun.logs.filter(l =>
      l.message && l.message.includes('ALERT DEVIATION')
    );

    if (deviationLogs.length > 0) {
      // Phân tích log để gắn alert cho drone, ví dụ: "⚠️  [...d79ec4] ALERT DEVIATION: ..."
      // Extract droneId from log message if possible
      deviationLogs.forEach(log => {
        const match = log.message.match(/\[([^\]]+)\] ALERT DEVIATION/);
        if (match) {
          const shortDroneId = match[1].replace('...', '');
          // update any droneId that ends with shortDroneId
          setDronesLiveProps(prev => {
            const newProps = { ...prev };
            for (const key of Object.keys(newProps)) {
              if (key.endsWith(shortDroneId)) {
                newProps[key] = {
                  ...newProps[key],
                  alertText: 'DEVIATION',
                  alertTime: Date.now()
                };
              }
            }
            return newProps;
          });
        }
      });
    }

  }, [currentRun?.logs]);

  // Clean up old alerts (ví dụ sau 3s không tái hiện thì xoá viền đỏ)
  useEffect(() => {
    const interval = setInterval(() => {
      setDronesLiveProps(prev => {
        let changed = false;
        const next = { ...prev };
        const now = Date.now();
        for (const key of Object.keys(next)) {
          if (next[key].alertTime && (now - next[key].alertTime > 3000)) {
            next[key] = { ...next[key] };
            delete next[key].alertTime;
            delete next[key].alertText;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { dronesLiveProps };
}
