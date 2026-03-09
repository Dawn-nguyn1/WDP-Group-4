import React, { useEffect, useState } from "react";
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
import styles from "../styles/DronePage.module.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { confirm } = Modal;

const DronePage = () => {
  const dispatch = useDispatch();
  const drones = useSelector(selectDronesList);
  const loading = useSelector(selectDronesLoading);

  const [formVisible, setFormVisible] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);

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
          .then(() => {
            dispatch(fetchDrones());
          });
      },
    });
  };

  const handleRowClick = (record) => {
    setSelectedDroneId(record._id);
    setDrawerVisible(true);
  };

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
        let color = "default";
        if (status === "IDLE") color = "success";
        if (status === "IN_FLIGHT") color = "processing";
        if (status === "MAINTENANCE") color = "error";
        return <Badge status={color} text={status} />;
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
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1677ff" }} />}
              onClick={(e) => handleEdit(record, e)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => handleDelete(record._id, e)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card
        title={
          <div className={styles.header}>
            <Title level={4} style={{ margin: 0 }}>
              Quản lý Drone
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm Drone
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={drones}
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
