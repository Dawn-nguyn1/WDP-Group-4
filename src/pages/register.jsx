import React from 'react';
import { Button, Form, Input, Row, Col, Tabs, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import OIPImage from '../assets/OIP.jpg';
import './styles/register.css';
import {registerUserAPI} from '../services/api.service';

const RegisterPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const res = await registerUserAPI(values.fullName, values.email, values.password);
        if (res.user) {
            notification.success({
                title: "Register success",
                description: "Tạo tài khoản thành công!",
            });
        } else {
            notification.error({
                title: "Register failed",
                description: JSON.stringify(res.message),
            });
        }
        console.log(">>>>> response tu API:", res.user);


    };
    const handleTabChange = (key) => {
        if (key === 'login') {
            navigate('/login');
        }
    };

    const items = [
        {
            key: 'login',
            label: 'Đăng nhập', 
        },
        {
            key: 'register',
            label: 'Đăng ký',
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
                        rules={[{ required: true, message: 'Please input your fullName!' }]}
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
                            { required: true, message: 'Please input your email!' },
                            { type: "email", message: 'Email không đúng định dạng!' }
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
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item>

                    {/* <Form.Item
                        label="Phone number"
                        name="phone"
                        rules={[
                            { required: true, message: 'Nhập số điện thoại!' },
                            { pattern: new RegExp(/\d+/g), message: "Wrong format!" }
                        ]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item> */}

                    <Form.Item className="form-actions">
                        <Button
                            htmlType="submit"
                            type="primary"
                            className="modern-button"
                            size="large"
                            block
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>

                    <div className="form-footer">
                        <span>Đã có tài khoản? </span>
                        <Link to="/login" className="modern-link">Đăng nhập tại đây</Link>
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
    )
}

export default RegisterPage;