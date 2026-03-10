import React from "react";
import { Alert, List, Typography, Badge, Card, Space } from "antd";

const { Text, Title } = Typography;

const ConflictViewer = ({ conflicts, planStatus }) => {
  if (!conflicts || conflicts.length === 0) {
    if (planStatus === "APPROVED") {
      return (
        <Alert
          message="Hệ thống xác nhận"
          description="Kế hoạch bay an toàn, không có xung đột với các chuyến bay hoặc vùng cấm bay khác."
          type="success"
          showIcon
        />
      );
    }
    return null;
  }

  return (
    <Card
      title={
        <Title level={5} style={{ color: "#cf1322", margin: 0 }}>
          Phát Hiện Xung Đột
        </Title>
      }
      style={{ borderColor: "#ffa39e", background: "#fff1f0", marginTop: 16 }}
      bodyStyle={{ padding: "12px 24px" }}
    >
      <Alert
        message={`${conflicts.length} xung đột được phát hiện`}
        description="Kế hoạch bay này đã bị từ chối do vi phạm quy tắc an toàn bay. Vui lòng xem chi tiết bên dưới."
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <List
        dataSource={conflicts}
        renderItem={(item, index) => (
          <List.Item>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>
                  Xung đột #{index + 1}: {item.detectionMethod}
                </Text>
                <Badge
                  count={item.severity}
                  style={{
                    backgroundColor:
                      item.severity === "HIGH" ? "#cf1322" : "#faad14",
                  }}
                />
              </div>
              <Text type="secondary">
                Khoảng cách ngang: {item.horizontalDistance}m, Dọc:{" "}
                {item.verticalDistance}m
              </Text>
              <Text>
                Tọa độ dự kiến: {item.location?.coordinates[1]},{" "}
                {item.location?.coordinates[0]}
                {item.altitude && ` ở ${item.altitude}m`}
              </Text>
              <Text>
                Thời gian va chạm dự kiến:{" "}
                {new Date(item.predictedCollisionTime).toLocaleString()}
              </Text>
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ConflictViewer;
