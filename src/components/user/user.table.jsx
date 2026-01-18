import React from 'react';
import { Table, Popconfirm, notification } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
// import { deleteUserAPI } from "../../services/api.service";
import UpdateUserModal from './update.user.modal';
import ViewUserDetail from './user.detail';

const UserTable = (props) => {
    const { dataUsers, loadUser, current, pageSize, total,
        setCurrent, setPageSize,
    } = props;

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);

    const [dataUpdate, setDataUpdate] = useState(null);

    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const columns = [
        {
            title: 'STT',
            render: (_, record, index) => {
                return (
                    <>{(index + 1) + (current - 1) * pageSize}</>
                )
            }
        },
        {
            title: 'Id',
            dataIndex: '_id', //để xác định thuộc tính nào trong object dữ liệu (DB) sẽ được hiển thị ở cột đó.
            render: (_, record) => {
                return (
                    <a
                        href='#'
                        onClick={() => {
                            setDataDetail(record);
                            setIsDetailOpen(true);
                        }}
                    >{record._id}</a>
                )
            }
        },
        {
            title: 'Avatar',
            dataIndex: ['profile', 'avatar'],
            render: (avatar) => (
                <img 
                    src={avatar} 
                    alt="avatar" 
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
            )
        },
        {
            title: 'Full Name',
            dataIndex: ['profile', 'fullName'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => (
                <span style={{ 
                    color: status === 'active' ? 'green' : 'red',
                    fontWeight: 'bold'
                }}>
                    {status}
                </span>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: "flex", gap: "20px" }}>
                    <EditOutlined
                        onClick={() => {
                            setDataUpdate(record);
                            setIsModalUpdateOpen(true);
                        }}
                        style={{ cursor: "pointer", color: "orange" }} />
                    <Popconfirm
                        title="Xóa người dùng"
                        description="Bạn chắc chắn xóa user này ?"
                        onConfirm={() => handleDeleteUser(record._id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"

                    >
                        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const handleDeleteUser = async (id) => {
        // Mock delete for now - just remove from array
        const res = { data: true }; // Mock successful response
        
        if (res.data) {
            notification.success({
                message: "Delete user",
                description: "Xóa user thành công"
            })
            await loadUser();

        } else {
            notification.error({
                message: "Error delete user",
                description: JSON.stringify(res.message)
            })
        }
    }
    const onChange = (pagination, filters, sorter, extra) => {
        console.log ("check onChange:", pagination, filters, sorter, extra)
        //setCurrent, setPageSize
        //neu thay doi trang: current
        if (pagination && pagination.current) {
            if (pagination.current !== +current) {
                setCurrent(+pagination.current) //+: chuyen string thanh so nguyen
            }
        }
        //neu thay doi tong so Ptu: pageSize
        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== +pageSize) {
                setPageSize(+pagination.pageSize)
            }
        }

        console.log({ pagination, filters, sorter, extra })
    };

    return (
        <>
            <Table
            className="user-table"
                columns={columns}
                dataSource={dataUsers}
                rowKey={"_id"}
                pagination={
                    {
                        current: current,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        total: total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                    }}
                onChange={onChange}

            />
            <UpdateUserModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadUser={loadUser}
            />

            <ViewUserDetail
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isDetailOpen={isDetailOpen}
                setIsDetailOpen={setIsDetailOpen}
                loadUser={loadUser}
            />
        </>
    )
}

export default UserTable;