import React, { useEffect } from "react";
import { Drawer, Descriptions, Tag, Typography, Spin, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getDroneDetail,
  selectCurrentDrone,
  selectDronesLoading,
  clearCurrentDrone,
} from "../slices/droneSlice";
import dayjs from "dayjs";

const { Title } = Typography;

const DroneDetailDrawer = ({ droneId, visible, onClose }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectDronesLoading);
  const drone = useSelector(selectCurrentDrone);

  useEffect(() => {
    if (visible && droneId) {
      console.log('=== DRONE DRAWER OPEN ===');
      console.log('Drone ID:', droneId);
      console.log('Visible:', visible);
      
      dispatch(getDroneDetail(droneId));
    } else if (!visible) {
      console.log('=== DRONE DRAWER CLOSE ===');
      dispatch(clearCurrentDrone());
    }
  }, [visible, droneId, dispatch]);

  // Debug drone data
  useEffect(() => {
    console.log('=== DRONE STATE UPDATE ===');
    console.log('Loading:', loading);
    console.log('Drone data:', drone);
    console.log('Drone type:', typeof drone);
    console.log('=== END DRONE STATE ===');
  }, [drone, loading]);

  const getStatusColor = (status) => {
    switch (status) {
      case "IDLE":
        return "success";
      case "IN_FLIGHT":
        return "processing";
      case "MAINTENANCE":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} style={{ margin: 0 }}>
          Chi Tiết Drone
        </Title>
      }
      placement="right"
      width={500}
      onClose={onClose}
      open={visible}
      destroyOnClose
    >
      {loading ?
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      : drone ?
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Số Serial">
            <strong>{drone.serialNumber}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="Dòng máy">{drone.model}</Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Badge status={getStatusColor(drone.status)} text={drone.status} />
          </Descriptions.Item>

          <Descriptions.Item label="Độ cao tối đa">
            {drone.maxAltitude} m
          </Descriptions.Item>

          <Descriptions.Item label="Sở hữu bởi">
            {drone.owner?.profile?.fullName || drone.owner?.email || "Unknown"}
            <br />
            <Tag style={{ marginTop: 4 }}>{drone.ownerType}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {dayjs(drone.createdAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>
      : <div style={{ textAlign: "center", color: "#999" }}>
          Không tìm thấy thông tin drone.
        </div>
      }
    </Drawer>
  );
};

export default DroneDetailDrawer;
