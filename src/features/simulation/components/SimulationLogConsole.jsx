import React, { useEffect, useRef } from "react";
import { Card, Typography, Empty } from "antd";

const { Text } = Typography;

const SimulationLogConsole = ({ currentRun, compact = false }) => {
  const containerRef = useRef(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentRun?.logs]);

  const consoleHeight = compact ? '120px' : '400px';

  if (!currentRun) {
    return (
      <Card 
        title="Simulation Console" 
        bordered={false} 
        className="shadow-sm mb-4"
        size={compact ? "small" : "default"}
        styles={{ body: { padding: compact ? '8px 12px' : undefined } }}
      >
        <Empty description="No active simulation run" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <Card 
      title={`Console Output - Status: ${currentRun.status}`} 
      bordered={false} 
      className="shadow-sm mb-4"
      size={compact ? "small" : "default"}
      styles={{ body: { padding: compact ? '8px 12px' : undefined } }}
    >
      <div 
        ref={containerRef}
        className="bg-gray-900 border border-gray-700 rounded-md p-3 overflow-y-auto font-mono text-xs"
        style={{
          height: consoleHeight,
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 transparent'
        }}
      >
        {currentRun.logs && currentRun.logs.length > 0 ? (
          currentRun.logs.map((log, index) => {
            const isError = log.stream === 'stderr';
            
            // Try to extract time formatted nicely
            let timeStr = "";
            if (log.ts) {
              const d = new Date(log.ts);
              timeStr = `[${d.toLocaleTimeString()}] `;
            }

            return (
              <div key={index} className="mb-0.5 break-words leading-tight">
                <Text className="text-gray-500" style={{ fontSize: '11px' }}>{timeStr}</Text>
                <Text style={{ color: isError ? '#ef4444' : '#10b981', fontSize: '11px' }}>{log.message}</Text>
              </div>
            );
          })
        ) : (
          <div className="text-gray-500 italic text-xs">Waiting for simulation logs...</div>
        )}
      </div>
    </Card>
  );
};

export default SimulationLogConsole;
