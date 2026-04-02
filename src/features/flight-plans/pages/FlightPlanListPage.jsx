import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Space,
  Typography,
  Tag,
  Tooltip,
} from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Modal, message } from "antd";
import {
  fetchFlightPlans,
  selectFlightPlansList,
  selectFlightPlansLoading,
  deleteFlightPlan,
} from "../slices/flightPlanSlice";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const FlightPlanListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectFlightPlansLoading);
  const flightPlans = useSelector(selectFlightPlansList);

  useEffect(() => {
    dispatch(fetchFlightPlans({ page: 1, limit: 10, status: 'ACTIVE' }));
  }, [dispatch]);

  const handleDeleteFlightPlan = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa kế hoạch bay",
      content: `Bạn có chắc chắn muốn xóa kế hoạch bay "${record._id?.slice(-6).toUpperCase()}"? Kế hoạch sẽ được chuyển sang trạng thái INACTIVE và không thể sử dụng trong mission.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await dispatch(deleteFlightPlan(record._id)).unwrap();
          message.success("Xóa kế hoạch bay thành công!");
          // Refresh list
          dispatch(fetchFlightPlans({ page: 1, limit: 10, status: 'ACTIVE' }));
        } catch (error) {
          console.error("Delete flight plan error:", error);
          message.error(error?.message || "Xóa kế hoạch bay thất bại!");
        }
      },
    });
  };

  const columns = [
    {
      title: "Chuyến bay",
      key: "id",
      dataIndex: "_id",
      render: (id) => <Tag>{id.substring(id.length - 6).toUpperCase()}</Tag>,
    },
    {
      title: "Drone",
      key: "drone",
      dataIndex: "drone",
      render: (drone) => (
        <div>
          <div>{drone?.model || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {drone?.serialNumber || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Pilot",
      key: "pilot",
      dataIndex: "pilot",
      render: (pilot) => (
        <div>
          <div>{pilot?.profile?.fullName || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {pilot?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Conflict Status",
      key: "conflictStatus",
      dataIndex: "conflictStatus",
      render: (conflictStatus) => {
        const getColor = (status) => {
          switch (status) {
            case "CLEAR": return "success";
            case "WARNING": return "warning";
            case "CONFLICT": return "error";
            default: return "default";
          }
        };
        return <Tag color={getColor(conflictStatus)}>{conflictStatus || "N/A"}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#1677ff" }} />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/operator/flight-plans/${record._id}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa kế hoạch bay">
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFlightPlan(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Quản lý Kế Hoạch Bay (Flight Plans)
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/operator/flight-plans/new")}
            >
              Tạo Kế Hoạch Bay
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={flightPlans}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => navigate(`/operator/flight-plans/${record._id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
};

export default FlightPlanListPage;
