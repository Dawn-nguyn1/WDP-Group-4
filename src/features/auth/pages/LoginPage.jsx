import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, Row, Col, Tabs, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, selectIsLoading } from "../slices/authSlice";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);

  const onFinish = async (values) => {
    try {
      const result = await dispatch(
        loginUser({
          email: values.email,
          password: values.password,
        }),
      ).unwrap();

      if (result.user) {
        notification.success({
          message: "Login success",
          description: "Đăng nhập thành công!",
        });
        // Redirect based on role
        const role = result.user.role;
        if (role === "UTM_ADMIN") {
          navigate("/admin/dashboard");
        } else if (role === "FLEET_OPERATOR") {
          navigate("/operator/drones");
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      notification.error({
        message: "Login failed",
        description: error || "Đăng nhập thất bại!",
      });
    }
  };

  const handleTabChange = (key) => {
    if (key === "register") {
      navigate("/register");
    }
  };

  const items = [
    {
      key: "login",
      label: "Đăng nhập",
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="modern-form"
        >
          <div className="form-header">
            <h2>Chào mừng bạn!</h2>
            <p>Vui lòng nhập thông tin để đăng nhập.</p>
          </div>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email không được để trống!" },
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
            rules={[
              { required: true, message: "Password không được để trống!" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu của bạn"
              className="modern-input"
              size="large"
              onKeyDown={(event) => {
                if (event.key === "Enter") form.submit();
              }}
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button
              type="primary"
              onClick={() => form.submit()}
              className="modern-button"
              size="large"
              block
              loading={isLoading}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div className="form-footer">
            <span>Chưa có tài khoản? </span>
            <Link to="/register" className="modern-link">
              Đăng ký tại đây
            </Link>
          </div>
        </Form>
      ),
    },
    {
      key: "register",
      label: "Đăng ký",
    },
  ];

  return (
    <div className="login-container">
      <Row className="login-row">
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
              defaultActiveKey="login"
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

export default LoginPage;
