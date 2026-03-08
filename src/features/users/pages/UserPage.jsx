import React from "react";
import { useEffect, useState } from "react";
import { mockUsers } from "../data/mockUsers";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import "../styles/UserPage.css";
import { fetchUsersAPI } from "../services/userApi";

const UserPage = () => {
  const [dataUsers, setDataUsers] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUser();
  }, [current, pageSize]);

  const loadUser = async () => {
    const res = await fetchUsersAPI();

    if (res && Array.isArray(res)) {
      setDataUsers(res);
      setTotal(res.length);
    } else if (res && res.data && Array.isArray(res.data)) {
      setDataUsers(res.data);
      setTotal(res.data.length);
    } else {
      setDataUsers(mockUsers);
      setTotal(mockUsers.length);
    }
  };

  return (
    <div className="user-page-container">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage and view all users in the system</p>
      </div>

      <UserForm loadUser={loadUser} />

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
