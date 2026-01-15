import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import {
    UsergroupAddOutlined,
    HomeOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';

import { useState } from 'react';

const Header = () => {
    const [current, setCurrent] = useState('');

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
        // {
        //     label: <Link to={"/login"}>Đăng nhập</Link>,
        //     key: 'login',
        //     icon: <PlayCircleOutlined />,
        // },
        // {
        //     label: <Link to={"/register"}>Đăng ký</Link>,
        //     key: 'register',
        //     icon: <PlayCircleOutlined />,
        // },
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