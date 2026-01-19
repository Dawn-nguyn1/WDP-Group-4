import React from 'react';
import { useEffect, useState } from 'react';
import { mockUsers } from './user.data';
import UserTable from './user.table';
import UserForm from './user.form';
import './user.css'; // Import CSS file

const UserPage = () => {
    const [dataUsers, setDataUsers] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Empty array => run once
    useEffect(() => {
        loadUser();
    }, [current, pageSize]);

    const loadUser = async () => {
        // Use mock data for now
        setDataUsers(mockUsers);
        setTotal(mockUsers.length);
        
        // Uncomment when API is ready
        // const res = await fetchAllUserAPI(current, pageSize)
        // if (res.data) {
        //     setDataUsers(res.data.result)
        //     setCurrent(res.data.meta.current)
        //     setPageSize(res.data.meta.pageSize)
        //     setTotal(res.data.meta.total)
        // }
    };

    return (
        <div className="user-page-container">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage and view all users in the system</p>
            </div>

            {/* User Form - Uncomment when ready */}
            <UserForm loadUser={loadUser} />

            {/* User Table */}
            <UserTable
                loadUser={loadUser}
                dataUsers={dataUsers}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize} 
            />
        </div>
    );
};

export default UserPage;