import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Menu, notification } from "antd";
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  // WarningOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  selectUser,
  logoutUser,
} from "../../../features/auth/slices/authSlice";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
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

  // Determine current selected key from path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes("/admin/users")) return "users";
    if (path.includes("/admin/zones")) return "zones";
    // if (path.includes("/admin/conflicts")) return "conflicts";
    if (path.includes("/admin/profile")) return "profile";
    return "dashboard";
  };

  const menuItems = [
    {
      label: <Link to="/admin/dashboard">Dashboard</Link>,
      key: "dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: <Link to="/admin/users">Users</Link>,
      key: "users",
      icon: <UsergroupAddOutlined />,
    },
    {
      label: <Link to="/admin/zones">Zones</Link>,
      key: "zones",
      icon: <EnvironmentOutlined />,
    },
    // Conflicts - HIDDEN
    // {
    //   label: <Link to="/admin/conflicts">Conflicts</Link>,
    //   key: "conflicts",
    //   icon: <WarningOutlined />,
    // },
    { type: "divider" },
    {
      label: <Link to="/admin/profile">Profile</Link>,
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
        <div className={styles.logo}>UTM Admin</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.profile?.fullName || user?.email || "Admin"}
          </span>
          <span className={styles.userRole}>UTM Administrator</span>
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

export default AdminLayout;
