import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  RocketOutlined,
  SendOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import styles from "../styles/OperatorDashboard.module.css";

const OperatorDashboard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Operator Dashboard</h1>
        <p className={styles.subtitle}>Manage your drones and flights</p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="My Drones"
              value={0}
              prefix={<RocketOutlined />}
              valueStyle={{ color: "#3182ce" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Flight Plans"
              value={0}
              prefix={<SendOutlined />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Active Sessions"
              value={0}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: "#d97706" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Zones Nearby"
              value={0}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: "#dc2626" }}
            />
          </Card>
        </Col>
      </Row>

      <div className={styles.section}>
        <h2>Quick Actions</h2>
        <p style={{ color: "#718096" }}>
          Dashboard content will be populated in Phase 5.
        </p>
      </div>
    </div>
  );
};

export default OperatorDashboard;
