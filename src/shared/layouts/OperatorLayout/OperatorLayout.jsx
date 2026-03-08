import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Menu, notification } from "antd";
import {
  DashboardOutlined,
  RocketOutlined,
  SendOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  selectUser,
  logoutUser,
} from "../../../features/auth/slices/authSlice";
import styles from "./OperatorLayout.module.css";

const OperatorLayout = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
      notification.success({
        message: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống.",
      });
    } catch {
      navigate("/login");
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/operator/drones")) return "drones";
    if (path.includes("/operator/flight-plans")) return "flight-plans";
    if (path.includes("/operator/flight-sessions")) return "flight-sessions";
    if (path.includes("/operator/zones")) return "zones";
    if (path.includes("/operator/profile")) return "profile";
    return "dashboard";
  };

  const menuItems = [
    {
      label: <Link to="/operator/dashboard">Dashboard</Link>,
      key: "dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: <Link to="/operator/drones">Drones</Link>,
      key: "drones",
      icon: <RocketOutlined />,
    },
    {
      label: <Link to="/operator/flight-plans">Flight Plans</Link>,
      key: "flight-plans",
      icon: <SendOutlined />,
    },
    {
      label: <Link to="/operator/flight-sessions">Flight Sessions</Link>,
      key: "flight-sessions",
      icon: <PlayCircleOutlined />,
    },
    {
      label: <Link to="/operator/zones">Zones</Link>,
      key: "zones",
      icon: <EnvironmentOutlined />,
    },
    { type: "divider" },
    {
      label: <Link to="/operator/profile">Profile</Link>,
      key: "profile",
      icon: <UserOutlined />,
    },
    {
      label: <span onClick={handleLogout}>Đăng xuất</span>,
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>UTM Operator</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.profile?.fullName || user?.email || "Operator"}
          </span>
          <span className={styles.userRole}>Fleet Operator</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className={styles.menu}
          style={{ borderRight: 0 }}
        />
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default OperatorLayout;
