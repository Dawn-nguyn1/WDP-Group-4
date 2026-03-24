import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Typography, message } from 'antd';
import { fetchPayments, fetchRevenue, clearError } from '../slices/dashboardSlice';
import DashboardStats from '../components/DashboardStats';
import RevenueChart from '../components/RevenueChart';
import PaymentTable from '../components/PaymentTable';
import '../styles/DashboardStyles.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { payments, revenue, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    // Fetch data on component mount
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchPayments()).unwrap(),
          dispatch(fetchRevenue()).unwrap()
        ]);
      } catch (error) {
        message.error('Không thể tải dữ liệu dashboard');
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <Layout className="dashboard-container">
      <Header className="dashboard-header">
        <div>
          <Title level={2} className="dashboard-title">Admin Dashboard</Title>
          <Text className="dashboard-subtitle">Quản lý và theo dõi hệ thống</Text>
        </div>
      </Header>
      
      <Content>
        <div className="stats-row">
          <DashboardStats 
            payments={payments} 
            revenue={revenue} 
            loading={loading} 
          />
        </div>

        <div className="chart-card">
          <RevenueChart 
            revenue={revenue} 
            loading={loading} 
          />
        </div>

        <div className="payment-table-card">
          <PaymentTable 
            payments={payments} 
            loading={loading} 
          />
        </div>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;