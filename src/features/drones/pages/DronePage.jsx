import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Badge,
  Tooltip,
  message,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDrones,
  deleteDrone,
  selectDronesList,
  selectDronesLoading,
} from "../slices/droneSlice";
import DroneForm from "../components/DroneForm";
import DroneDetailDrawer from "../components/DroneDetailDrawer";
import listStyles from "../../../shared/styles/listPages.module.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const DronePage = () => {
  const dispatch = useDispatch();
  const drones = useSelector(selectDronesList);
  const loading = useSelector(selectDronesLoading);

  const [formVisible, setFormVisible] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDroneId, setSelectedDroneId] = useState(null);

  useEffect(() => {
    dispatch(fetchDrones());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingDrone(null);
    setFormVisible(true);
  };

  const handleEdit = (drone, e) => {
    e.stopPropagation();
    setEditingDrone(drone);
    setFormVisible(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn xóa drone này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        dispatch(deleteDrone(id))
          .unwrap()
          .then((result) => {
            message.success(result?.message || "Xóa drone thành công");
            dispatch(fetchDrones());
          });
      },
    });
  };

  const handleRowClick = (record) => {
    setSelectedDroneId(record._id);
    setDrawerVisible(true);
  };

  const filteredDrones = useMemo(() => {
    if (!searchText) return drones;
    
    const searchLower = searchText.toLowerCase();
    return drones.filter(drone => 
      drone.serialNumber?.toLowerCase().includes(searchLower) ||
      drone.model?.toLowerCase().includes(searchLower)
    );
  }, [drones, searchText]);

  const columns = [
    {
      title: "Số Serial",
      dataIndex: "serialNumber",
      key: "serialNumber",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Dòng máy",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const isActive = status === "IDLE";
        return (
          <span className={`${listStyles.statusBadge} ${isActive ? listStyles.statusActive : listStyles.statusInactive}`}>
            {status}
          </span>
        );
      },
    },
    {
      title: "Độ cao max",
      dataIndex: "maxAltitude",
      key: "maxAltitude",
      render: (val) => `${val}m`,
    },
    {
      title: "Ngày thêm",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <button
              className={`${listStyles.actionButton} ${listStyles.actionButtonView}`}
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }}
            >
              <EyeOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <button
              className={`${listStyles.actionButton} ${listStyles.actionButtonEdit}`}
              onClick={(e) => handleEdit(record, e)}
            >
              <EditOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Xóa">
            <button
              className={`${listStyles.actionButton} ${listStyles.actionButtonDelete}`}
              onClick={(e) => handleDelete(record._id, e)}
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
            Quản lý Drone
          </Title>
          <div className={listStyles.pageHeaderRight}>
            <Search
              placeholder="Tìm theo serial hoặc model"
              allowClear
              className={listStyles.searchInput}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button 
              className={listStyles.createButtonBlue} 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Thêm Drone
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDrones}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      <DroneForm
        visible={formVisible}
        editingDrone={editingDrone}
        onCancel={() => setFormVisible(false)}
        onSuccess={() => {
          setFormVisible(false);
          dispatch(fetchDrones());
        }}
      />

      <DroneDetailDrawer
        visible={drawerVisible}
        droneId={selectedDroneId}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  );
};

export default DronePage;
