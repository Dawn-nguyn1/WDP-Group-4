import React from 'react';
import { Button, Form, Input, Row, Col, Tabs } from "antd";
import { Link } from "react-router-dom";
import OIPImage from '../assets/OIP.jpg';
import './register.css';

const RegisterPage = () => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log("name, email va password:", values);
    };

    const items = [
        {
            key: 'login',
            label: <Link to="/login">Đăng nhập</Link>,
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
                    
                    <Form.Item
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
                    </Form.Item>
                    
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
                            <h1>Green Space</h1>
                            <h2>Bonsai</h2>
                            <p>Tham gia cộng đồng bonsai của chúng tôi</p>
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
                        />
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default RegisterPage;