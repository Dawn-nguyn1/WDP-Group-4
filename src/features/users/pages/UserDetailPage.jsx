import { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Spin,
  Button,
  Space,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetailAPI } from "../services/userApi";
import dayjs from "dayjs";
import React from "react";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const res = await getUserDetailAPI(id);
      if (res && res.data) {
        setUser(res.data);
      }
    } catch (error) {
      console.error("Fetch user detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "UTM_ADMIN":
        return "red";
      case "FLEET_OPERATOR":
        return "blue";
      case "INDIVIDUAL_OPERATOR":
        return "green";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "UTM_ADMIN":
        return "UTM Admin";
      case "FLEET_OPERATOR":
        return "Fleet Operator";
      case "INDIVIDUAL_OPERATOR":
        return "Individual Operator";
      default:
        return role;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge status="success" text="Active" />;
      case "inactive":
        return <Badge status="default" text="Inactive" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <p>Không tìm thấy thông tin người dùng</p>
          <Button onClick={() => navigate("/admin/users")}>
            <ArrowLeftOutlined /> Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Chi tiết người dùng</span>
          </Space>
        }
        extra={
          <Button onClick={() => navigate("/admin/users")}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
        }
      >
        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="ID">{user._id}</Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <MailOutlined />
                Email
              </Space>
            }
          >
            {user.email}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                Họ tên
              </Space>
            }
          >
            {user.profile?.fullName || "Chưa cập nhật"}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <SafetyOutlined />
                Vai trò
              </Space>
            }
          >
            <Tag color={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <CheckCircleOutlined />
                Trạng thái
              </Space>
            }
          >
            {getStatusBadge(user.status)}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <KeyOutlined />
                Phương thức đăng nhập
              </Space>
            }
          >
            {user.providers?.local ? (
              <Tag color="blue">Local</Tag>
            ) : (
              <Tag>OAuth</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <ClockCircleOutlined />
                Ngày tạo
              </Space>
            }
          >
            {dayjs(user.createdAt).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <ClockCircleOutlined />
                Cập nhật lần cuối
              </Space>
            }
          >
            {dayjs(user.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
          </Descriptions.Item>

          <Descriptions.Item label="Số phiên đăng nhập">
            {user.refreshTokens?.length || 0} phiên
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserDetailPage;
