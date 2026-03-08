import { useEffect, useState } from "react";
import { Input, notification, Modal, Select, Form } from "antd";
import { updateUserAPI } from "../services/userApi";
import React from "react";

const { Option } = Select;

const UpdateUserModal = (props) => {
  const [form] = Form.useForm();

  const {
    isModalUpdateOpen,
    setIsModalUpdateOpen,
    dataUpdate,
    setDataUpdate,
    loadUser,
  } = props;

  useEffect(() => {
    if (dataUpdate) {
      form.setFieldsValue({
        _id: dataUpdate._id,
        fullName: dataUpdate.profile?.fullName || dataUpdate.fullName,
        email: dataUpdate.email,
        role: dataUpdate.role,
        status: dataUpdate.status,
      });
    }
  }, [dataUpdate, form]);

  const onFinish = async (values) => {
    try {
      const res = await updateUserAPI(values._id, {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: values.role,
        status: values.status,
      });

      if (res && (res.user || res._id)) {
        const user = res.user || res;
        notification.success({
          message: "Update user",
          description: `Cập nhật user "${user.profile?.fullName || user.email}" thành công!`,
        });
        resetAndCloseModal();
        await loadUser();
      } else {
        notification.error({
          message: "Error update user",
          description: "Không nhận được dữ liệu user hợp lệ",
        });
      }
    } catch (error) {
      console.error("Update user error:", error);
      notification.error({
        message: "Error update user",
        description:
          error?.message || "Cập nhật user thất bại, vui lòng thử lại!",
      });
    }
  };

  const resetAndCloseModal = () => {
    form.resetFields();
    setDataUpdate(null);
    setIsModalUpdateOpen(false);
  };

  return (
    <Modal
      title="Update User"
      open={isModalUpdateOpen}
      onOk={() => form.submit()}
      onCancel={() => resetAndCloseModal()}
      maskClosable={false}
      okText={"UPDATE"}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="ID" name="_id">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label={
            <span>
              Full Name <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="fullName"
          rules={[
            { required: true, message: "Full Name không được để trống!" },
            { min: 2, message: "Full Name phải có ít nhất 2 ký tự!" },
            { max: 50, message: "Full Name không quá 50 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập full name" size="large" />
        </Form.Item>

        <Form.Item
          label={
            <span>
              Email <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="email"
          rules={[
            { required: true, message: "Email không được để trống!" },
            { type: "email", message: "Email không đúng định dạng!" },
          ]}
        >
          <Input placeholder="Nhập email" size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          help="Để trống nếu không muốn đổi mật khẩu"
        >
          <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role không được để trống!" }]}
        >
          <Select style={{ width: "100%" }} size="large">
            <Option value="INDIVIDUAL_OPERATOR">Individual Operator</Option>
            <Option value="FLEET_OPERATOR">Fleet Operator</Option>
            <Option value="UTM_ADMIN">UTM Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Status không được để trống!" }]}
        >
          <Select style={{ width: "100%" }} size="large">
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateUserModal;
