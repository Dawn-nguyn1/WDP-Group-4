import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Modal,
  message,
} from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUser,
  selectIsLoading,
  updateProfile,
  deleteMyAccount,
} from "../../auth/slices/authSlice";
import styles from "../styles/ProfilePage.module.css";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        fullName: user.profile?.fullName,
        phone: user.profile?.phone,
      });
    }
  }, [user, form]);

  const handleUpdate = async (values) => {
    try {
      const resultAction = await dispatch(updateProfile(values));
      if (updateProfile.fulfilled.match(resultAction)) {
        message.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        message.error(resultAction.payload || "Failed to update profile");
      }
    } catch (error) {
      message.error("An unexpected error occurred");
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Delete Account",
      content:
        "Are you sure you want to delete your account? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const resultAction = await dispatch(deleteMyAccount());
        if (deleteMyAccount.fulfilled.match(resultAction)) {
          message.success("Account deleted successfully");
        } else {
          message.error(resultAction.payload || "Failed to delete account");
        }
      },
    });
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Card
        className={styles.profileCard}
        title={<Title level={3}>My Profile</Title>}
        extra={
          <Button
            type={isEditing ? "default" : "primary"}
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) form.resetFields(); // Reset if cancelling
            }}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        }
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* View Mode vs Edit Mode */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            disabled={!isEditing}
          >
            <Form.Item label="Role">
              <Input value={user.role} disabled />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>

            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>

            <Form.Item label="Phone" name="phone">
              <Input placeholder="Phone Number" />
            </Form.Item>

            {isEditing && (
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                >
                  Save Changes
                </Button>
              </Form.Item>
            )}
          </Form>

          {/* Danger Zone */}
          {!isEditing && (
            <div className={styles.dangerZone}>
              <Title level={5} type="danger">
                Danger Zone
              </Title>
              <Text type="secondary" className={styles.dangerText}>
                Permanently delete your account and all associated data.
              </Text>
              <Button danger onClick={handleDeleteAccount} loading={isLoading}>
                Delete Account
              </Button>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ProfilePage;
