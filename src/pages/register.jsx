import React from 'react'
import { Button, Form, Input, Row, Col, Divider } from "antd";
import { Link } from "react-router-dom";

const RegisterPage = () => {

  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("name, email, password va phone:", values);
  };
      return (

        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ margin: "30px" }}
        >
            <h3 style={{ textAlign: "center" }}>Đăng ký tài khoản</h3>
            <Row justify={"center"}>
                <Col xs={24} md={8} >
                    <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your fullName!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row justify={"center"}>
                <Col xs={24} md={8}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your email!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row justify={"center"}>
                <Col xs={24} md={8}>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Col>
            </Row>
            <Row justify={"center"}>
                <Col xs={24} md={8}>
                    <Form.Item
                        label="Phone number"
                        name="phone"
                        rules={[
                            {
                                required: true,
                                pattern: new RegExp(/\d+/g),
                                message: "Wrong format!"
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row justify={"center"}>
                <Col xs={24} md={8}>
                    <div>
                        <Button
                            htmlType="submit"
                            type="primary">Register</Button>
                    </div>
                    <Divider />
                    <div>Đã có tài khoản? <Link to={"/login"}>Đăng nhập tại đây</Link></div>
                </Col>
            </Row>

        </Form >
    )
}

export default RegisterPage