import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Tag, Typography, Spin, Badge } from "antd";
import { getZoneDetailAPI } from "../services/zoneApi";
import dayjs from "dayjs";

const { Title } = Typography;

const ZoneDetailDrawer = ({ zoneId, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [zone, setZone] = useState(null);

  useEffect(() => {
    if (visible && zoneId) {
      fetchZoneDetail();
    }
  }, [visible, zoneId]);

  const fetchZoneDetail = async () => {
    setLoading(true);
    try {
      const response = await getZoneDetailAPI(zoneId);
      setZone(response);
    } catch (error) {
      console.error("Failed to fetch zone details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "archived":
        return "error";
      default:
        return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "no_fly":
        return "red";
      case "restricted":
        return "orange";
      default:
        return "blue";
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} style={{ margin: 0 }}>
          Zone Details
        </Title>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
    >
      {loading ?
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      : zone ?
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">
            <strong>{zone.name}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            <Badge
              status={getStatusColor(zone.status)}
              text={zone.status.toUpperCase()}
            />
          </Descriptions.Item>

          <Descriptions.Item label="Type">
            <Tag color={getTypeColor(zone.type)}>
              {zone.type === "no_fly" ?
                "No Fly Zone"
              : zone.type === "restricted" ?
                "Restricted Zone"
              : zone.type}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Altitude Range">
            {zone.minAltitude}m - {zone.maxAltitude}m
          </Descriptions.Item>

          <Descriptions.Item label="Description">
            {zone.description || <em>No description provided</em>}
          </Descriptions.Item>

          {zone.effectiveFrom && (
            <Descriptions.Item label="Effective From">
              {dayjs(zone.effectiveFrom).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          )}

          {zone.effectiveTo && (
            <Descriptions.Item label="Effective To">
              {dayjs(zone.effectiveTo).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Created At">
            {dayjs(zone.createdAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>

          <Descriptions.Item label="Geometry">
            <pre
              style={{
                margin: 0,
                padding: 0,
                overflow: "auto",
                maxHeight: "150px",
              }}
            >
              {JSON.stringify(zone.geometry, null, 2)}
            </pre>
          </Descriptions.Item>
        </Descriptions>
      : <div style={{ textAlign: "center", color: "#999" }}>
          Zone not found or error loading details.
        </div>
      }
    </Drawer>
  );
};

export default ZoneDetailDrawer;
