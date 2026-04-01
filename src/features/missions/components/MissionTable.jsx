import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Modal, message, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMissions,
  deleteMission,
  deleteMissionWithPlans,
  selectMissionsList,
  selectMissionsLoading,
} from "../slices/missionSlice";
import MissionUpdateModal from "./MissionUpdateModal";
import dayjs from "dayjs";

const MissionTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const missions = useSelector(selectMissionsList);
  const loading = useSelector(selectMissionsLoading);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState(null);

  useEffect(() => {
    dispatch(fetchMissions({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleDelete = async (id) => {
    console.log('🗑️ [MissionTable] Attempting to delete mission:', id);
    try {
      const result = await dispatch(deleteMission(id)).unwrap();
      console.log('✅ [MissionTable] Mission deleted successfully:', result);
      message.success("Xóa mission thành công!");
      // Refetch to get updated list
      dispatch(fetchMissions({ page: 1, limit: 10 }));
    } catch (error) {
      console.error('❌ [MissionTable] Delete mission error:', error);
      console.error('❌ [MissionTable] Error response:', error.response?.data);
      message.error(error.response?.data?.message || "Xóa mission thất bại!");
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/operator/missions/${id}`);
  };

  const handleEdit = (id) => {
    setEditingMissionId(id);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingMissionId(null);
    dispatch(fetchMissions({ page: 1, limit: 10 }));
  };

  const handleEditClose = () => {
    setEditModalVisible(false);
    setEditingMissionId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "ACTIVE":
        return "processing";
      case "ARCHIVED":
        return "warning";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Tên Mission",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Người tạo",
      dataIndex: ["createdBy", "profile", "fullName"],
      key: "createdBy",
      render: (name, record) => (
        <div>
          <div>{name || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {record.createdBy?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record._id)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record._id)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa mission?"
            description="Bạn có chắc muốn xóa mission này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>Danh sách Missions</h2>
      </div>
      
      <Table
        columns={columns}
        dataSource={missions}
        loading={loading}
        rowKey="_id"
        pagination={{
          total: missions.length,
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: true,
        }}
      />

      {/* Edit Mission Modal */}
      <MissionUpdateModal
        visible={editModalVisible}
        missionId={editingMissionId}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default MissionTable;
