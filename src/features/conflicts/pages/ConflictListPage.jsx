import React, { useEffect } from "react";
import { Card, Table, Typography, Tag, Space, Button, Badge } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConflicts,
  selectConflictsList,
  selectConflictsLoading,
} from "../slices/conflictSlice";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title } = Typography;

const ConflictListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectConflictsLoading);
  const conflicts = useSelector(selectConflictsList);

  useEffect(() => {
    dispatch(fetchConflicts());
  }, [dispatch]);

  const columns = [
    {
      title: "ID Xung Đột",
      dataIndex: "_id",
      key: "id",
      render: (id) => <Tag>{id.substring(id.length - 6).toUpperCase()}</Tag>,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "processing";
        if (status === "ACTIVE") color = "error";
        if (status === "ACKNOWLEDGED") color = "warning";
        if (status === "RESOLVED") color = "success";
        return <Badge status={color} text={status} />;
      },
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (sev) => (
        <Tag
          color={
            sev === "HIGH" ? "red"
            : sev === "MEDIUM" ?
              "orange"
            : "blue"
          }
        >
          {sev}
        </Tag>
      ),
    },
    {
      title: "Phương pháp phát hiện",
      dataIndex: "detectionMethod",
      key: "detectionMethod",
    },
    {
      title: "Dự kiến va chạm",
      dataIndex: "predictedCollisionTime",
      key: "predictedCollisionTime",
      render: (time) =>
        time ? dayjs(time).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/conflicts/${record._id}`);
            }}
          >
            Giải quyết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Xung Đột (Conflicts)
          </Title>
        }
      >
        <Table
          columns={columns}
          dataSource={conflicts}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/conflicts/${record._id}`),
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
};

export default ConflictListPage;
