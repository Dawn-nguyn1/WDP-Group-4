import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  UsergroupAddOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import styles from "../styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Overview of the UTM system</p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Users"
              value={0}
              prefix={<UsergroupAddOutlined />}
              valueStyle={{ color: "#3182ce" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Active Zones"
              value={0}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Active Conflicts"
              value={0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#dc2626" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Running Sessions"
              value={0}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: "#d97706" }}
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

export default AdminDashboard;
