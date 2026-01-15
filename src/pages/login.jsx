import React from 'react';
import { Button, Form, Input, Row, Col, Tabs } from "antd";
import { Link } from "react-router-dom";
import OIPImage from '../assets/OIP.jpg';
import './login.css';

const LoginPage = () => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log("email va password:", values);
    };

    const items = [
        {
            key: 'login',
            label: 'Đăng nhập',
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
                            { required: true, message: 'Email không được để trống!' },
                            { type: "email", message: 'Email không đúng định dạng!' },
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
                            { required: true, message: 'Password không được để trống!' },
                        ]}
                    >
                        <Input.Password 
                            placeholder="Nhập mật khẩu của bạn" 
                            className="modern-input"
                            size="large"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') form.submit()
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
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    
                    <div className="form-footer">
                        <span>Chưa có tài khoản? </span>
                        <Link to="/register" className="modern-link">Đăng ký tại đây</Link>
                    </div>
                </Form>
            ),
        },
        {
            key: 'register',
            label: <Link to="/register">Đăng ký</Link>,
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
                        />
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default LoginPage;