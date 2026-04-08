import React, { useEffect, useRef } from "react";
import { Card, Typography, Empty } from "antd";

const { Text } = Typography;

const SimulationLogConsole = ({ currentRun }) => {
  const containerRef = useRef(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentRun?.logs]);

  if (!currentRun) {
    return (
      <Card title="Simulation Console" bordered={false} className="shadow-sm mt-4 h-[400px]">
        <Empty description="No active simulation run" />
      </Card>
    );
  }

  return (
    <Card 
      title={`Console Output - Status: ${currentRun.status}`} 
      bordered={false} 
      className="shadow-sm mt-4"
    >
      <div 
        ref={containerRef}
        className="bg-gray-900 border border-gray-700 rounded-md p-4 h-[400px] overflow-y-auto font-mono text-sm"
        style={{
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
              <div key={index} className="mb-1 break-words">
                <Text className="text-gray-500">{timeStr}</Text>
                <Text style={{ color: isError ? '#ef4444' : '#10b981' }}>{log.message}</Text>
              </div>
            );
          })
        ) : (
          <div className="text-gray-500 italic">Waiting for simulation logs...</div>
        )}
      </div>
    </Card>
  );
};

export default SimulationLogConsole;
