import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, Row, Col, Tabs, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, selectIsLoading } from "../slices/authSlice";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);

  const onFinish = async (values) => {
    try {
      const result = await dispatch(
        registerUser({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: "FLEET_OPERATOR",
        }),
      ).unwrap();

      if (result.user) {
        notification.success({
          message: "Register success",
          description: "Tạo tài khoản thành công!",
        });
        navigate("/login");
      }
    } catch (error) {
      notification.error({
        message: "Register failed",
        description: error || "Đăng ký thất bại!",
      });
    }
  };

  const handleTabChange = (key) => {
    if (key === "login") {
      navigate("/login");
    }
  };

  const items = [
    {
      key: "login",
      label: "Đăng nhập",
    },
    {
      key: "register",
      label: "Đăng ký",
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="modern-form"
        >
          <div className="form-header">
            <h2>Tạo tài khoản mới!</h2>
            <p>Vui lòng nhập thông tin để đăng ký.</p>
          </div>

          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Please input your fullName!" }]}
          >
            <Input
              placeholder="Nhập họ tên của bạn"
              className="modern-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Email không đúng định dạng!" },
            ]}
          >
            <Input
              placeholder="Nhập email của bạn"
              className="modern-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu của bạn"
              className="modern-input"
              size="large"
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button
              htmlType="submit"
              type="primary"
              className="modern-button"
              size="large"
              block
              loading={isLoading}
            >
              Đăng ký
            </Button>
          </Form.Item>

          <div className="form-footer">
            <span>Đã có tài khoản? </span>
            <Link to="/login" className="modern-link">
              Đăng nhập tại đây
            </Link>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <div className="register-container">
      <Row className="register-row">
        <Col xs={0} md={12} className="image-col">
          <div className="image-overlay">
            <div className="brand-content">
              <h1>Mini UTM </h1>
              <p>Quản lý và giám sát bay drone tầm thấp</p>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12} className="form-col">
          <div className="form-container">
            <Tabs
              defaultActiveKey="register"
              centered
              items={items}
              className="modern-tabs"
              onChange={handleTabChange}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;
