import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Typography, message } from 'antd';
import { fetchPayments, fetchRevenue, fetchDroneAnalytics, clearError } from '../slices/dashboardSlice';
import RevenueChart from '../components/RevenueChart';
import DroneStatsCard from '../components/DroneStatsCard';
import PaymentTable from '../components/PaymentTable';
import '../styles/DashboardStyles.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { payments, revenue, droneAnalytics, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    // Fetch data on component mount
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchPayments()).unwrap(),
          dispatch(fetchRevenue()).unwrap(),
          dispatch(fetchDroneAnalytics()).unwrap()
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
          <Title level={2} className="dashboard-title">Admin Dashboards</Title>
        </div>
      </Header>
      
      <Content>
        <div className="chart-card">
          <RevenueChart 
            revenue={revenue} 
            loading={loading} 
          />
        </div>

        <div className="drone-stats-card" style={{ marginBottom: 24 }}>
          <DroneStatsCard
            droneAnalytics={droneAnalytics}
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