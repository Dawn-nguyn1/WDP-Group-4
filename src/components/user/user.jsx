import React from 'react';
import { useEffect, useState } from 'react';
import { mockUsers } from './user.data';
import UserTable from './user.table';
import UserForm from './user.form';

const UserPage = () => {

    const [dataUsers, setDataUsers] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    //empty array => run once
    useEffect(() => {
        loadUser();
    }, [current, pageSize]);

    const loadUser = async () => {
        // Use mock data for now
        setDataUsers(mockUsers);
        setTotal(mockUsers.length);
        
        // const res = await fetchAllUserAPI(current, pageSize)
        // if (res.data) {
        //     setDataUsers(res.data.result)
        //     setCurrent(res.data.meta.current)
        //     setPageSize(res.data.meta.pageSize)
        //     setTotal(res.data.meta.total)
        // }
    }

    return (
        <div style={{ padding: "20px" }}>
            <UserForm 
            loadUser={loadUser}
             />
            <UserTable
                loadUser={loadUser}
                dataUsers={dataUsers}
                current = {current}
                pageSize= {pageSize}
                total = {total}
                setCurrent= {setCurrent}
                setPageSize= {setPageSize} 
                />
        </div>
    )
}

export default UserPage;