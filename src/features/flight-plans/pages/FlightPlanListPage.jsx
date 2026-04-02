import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Space,
  Typography,
  Tag,
  Tooltip,
  Input,
} from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Modal, message } from "antd";
import listStyles from "../../../shared/styles/listPages.module.css";
import { fetchFlightPlans, selectFlightPlansList, selectFlightPlansLoading, deleteFlightPlan, } from "../slices/flightPlanSlice";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Search } = Input;

const FlightPlanListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectFlightPlansLoading);
  const flightPlans = useSelector(selectFlightPlansList);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(fetchFlightPlans({ page: 1, limit: 10, status: 'ACTIVE' }));
  }, [dispatch]);

  const filteredFlightPlans = useMemo(() => {
    if (!searchText) return flightPlans;
    
    const searchLower = searchText.toLowerCase();
    return flightPlans.filter(plan => 
      plan.drone?.serialNumber?.toLowerCase().includes(searchLower) ||
      plan.drone?.model?.toLowerCase().includes(searchLower)
    );
  }, [flightPlans, searchText]);

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
      render: (id) => <strong>{id.substring(id.length - 6).toUpperCase()}</strong>,
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
        const isClear = conflictStatus === "CLEAR";
        return (
          <span className={`${listStyles.statusBadge} ${isClear ? listStyles.statusActive : listStyles.statusInactive}`}>
            {conflictStatus || "N/A"}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <button
              className={`${listStyles.actionButton} ${listStyles.actionButtonView}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/operator/flight-plans/${record._id}`);
              }}
            >
              <EyeOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Xóa kế hoạch bay">
            <button
              className={`${listStyles.actionButton} ${listStyles.actionButtonDelete}`}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFlightPlan(record);
              }}
            >
              <DeleteOutlined />
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={listStyles.pageContainer}>
      <Card className={listStyles.tableCard}>
        <div className={listStyles.pageHeader}>
          <Title level={4}>
            Quản lý Kế Hoạch Bay
          </Title>
          <div className={listStyles.pageHeaderRight}>
            <Search
              placeholder="Tìm theo serial hoặc model drone"
              allowClear
              className={listStyles.searchInput}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button 
              className={listStyles.createButtonBlue} 
              icon={<PlusOutlined />}
              onClick={() => navigate("/operator/flight-plans/new")}
            >
              Tạo Kế Hoạch Bay
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredFlightPlans}
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
