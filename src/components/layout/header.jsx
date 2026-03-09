import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Menu, notification } from 'antd';
import {
    UsergroupAddOutlined,
    HomeOutlined,
    AliwangwangOutlined,
    LoginOutlined,
    RocketOutlined
} from '@ant-design/icons';

import { useState } from 'react';
import { AuthContext } from '../../context/auth.context';
import { logoutAPI } from '../../services/api.service';

const Header = () => {
    const [current, setCurrent] = useState('');
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const handleLogout = async () => {
        const res = await logoutAPI();
        console.log("CHECK LOGOUT", res);

        if (res.message) {
            localStorage.removeItem("access_token");
            setUser({
                _id: "",
                email: "",
                profile: {
                    fullName: ""
                },
                role: "",
            });
            navigate("/login");
            
            notification.success({
                tittle: "Đăng xuất thành công",
                description: JSON.stringify(res.message)
            })
        } else {
            notification.error({
                tittle: "Đăng xuất thất bại",
                description: JSON.stringify(res.message)
            })
        }


    };

    const onClick = (e) => {
        if (e.key === 'logout') {
            handleLogout();
            return;
        }
        setCurrent(e.key);
    };

    const items = [
        {
            label: <Link to={"/homepage"}>Home</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={"/users"}>Users</Link>,
            key: 'users',
            icon: <UsergroupAddOutlined />
        },
        {
            label: <Link to={"/zones"}>Zones</Link>,
            key: 'zones',
            icon: <HomeOutlined />,
        },
        // {
        //     label: <Link to={"/flycams"}>Flycams</Link>,
        //     key: 'flycams',
        //     icon: <PlayCircleOutlined />,
        // },
        {
            label: <Link to={"/flight-planning"}>Flight Planning</Link>,
            key: 'flight-planning',
            icon: <RocketOutlined />,
        },

        ...(!user?._id ? [{
            label: <Link to={"/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),

        ...(user?._id ? [{
            label: `Welcome ${user.profile?.fullName ?? user.email}`,
            key: 'setting',
            icon: <AliwangwangOutlined />,
            children: [
                {
                    label: <span onClick={() => handleLogout()} >Đăng xuất</span>,
                    key: 'logout',
                },
            ],
        }] : []),
    ];

    return (
        <div
            style={{
                width: 256,
                height: '100vh',
                position: 'sticky',
                top: 0,
                left: 0,
                overflow: 'auto',
                borderRight: '1px solid #e2e8f0',
                background: '#fff'
            }}
        >
            <div
                style={{
                    padding: '16px 20px',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#fff',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                Mini UTM
            </div>
            <Menu
                onClick={onClick}
                style={{ width: 256, borderRight: 0 }}
                selectedKeys={current ? [current] : undefined}
                mode="inline"
                items={items}
            />
        </div>
    )
}

export default Header;