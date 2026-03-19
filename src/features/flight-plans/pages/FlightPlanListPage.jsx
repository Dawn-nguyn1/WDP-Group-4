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
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFlightPlans,
  selectFlightPlansList,
  selectFlightPlansLoading,
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
    dispatch(fetchFlightPlans({ page: 1, limit: 10 }));
  }, [dispatch]);

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case "DRAFT":
        return { status: "default", text: "DRAFT" };
      case "APPROVED":
        return { status: "success", text: "APPROVED" };
      case "REJECTED":
        return { status: "error", text: "REJECTED" };
      case "CANCELLED":
        return { status: "warning", text: "CANCELLED" };
      default:
        return { status: "processing", text: status };
    }
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
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => <Badge {...getStatusBadgeProps(status)} />,
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
