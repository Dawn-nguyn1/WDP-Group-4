import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import {
    UsergroupAddOutlined,
    HomeOutlined,
    PlayCircleOutlined,
    AliwangwangOutlined,
    LoginOutlined
} from '@ant-design/icons';

import { useState } from 'react';
import { AuthContext } from '../../context/auth.context';

const Header = () => {
    const [current, setCurrent] = useState('');
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    // const handleLogout = async () => {
    //     const res = await logoutAPI();
    //     if (res.data) {
    //         // clear data
    //         localStorage.removeItem("access_token");
    //         setUser({
    //             email: "",
    //             phone: "",
    //             fullName: "",
    //             role: "",
    //             avatar: "",
    //             id: ""
    //         })
    //         message.success("Logout thành công.");

    //         //redirect to home
    //         navigate("/");
    //     }
    // }


    const onClick = (e) => {
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
            label: <Link to={"/flycams"}>Flycams</Link>,
            key: 'flycams',
            icon: <PlayCircleOutlined />,
        },

        ...(!user._id ? [{
            label: <Link to={"/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),

        ...(user._id ? [{
            label: `Welcome ${user.profile.fullName}`,
            key: 'setting',
            icon: <AliwangwangOutlined />,
            children: [
                {
                    label: <span >Đăng xuất</span>,
                    key: 'logout',
                    onClick: () => handleLogout()
                },
            ],
        }] : []),
    ];

    return (
        <Menu
            onClick={onClick}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
        />
    )
}

export default Header;