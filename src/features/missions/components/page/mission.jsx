import React, { useState } from 'react';
import { Card, Typography, Button, Modal, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MissionTable from '../MissionTable';
import MissionForm from '../MissionForm';
import MissionPlans from '../../missionsplans/Missonplans';
import '../../../users/styles/UserPage.css';

const { Title } = Typography;
const { TabPane } = Tabs;

const MissionPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('missions');

  const handleCreateSuccess = () => {
    setFormVisible(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="user-page-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Mission</h1>
        <p className="page-subtitle">Manage and view all missions in the system</p>
      </div>
      
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {activeTab === 'missions' && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setFormVisible(true)}
          >
            Tạo Mission mới
          </Button>
        )}
      </div>

      {/* Tabs for switching between missions and mission plans */}
      <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Danh sách Missions" key="missions">
            <MissionTable />
          </TabPane>
          <TabPane tab="Mission Plans" key="missionPlans">
            <MissionPlans />
          </TabPane>
        </Tabs>
      </div>

      {/* Modal for creating mission */}
      <Modal
        title="Tạo Mission mới"
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <MissionForm onClose={() => setFormVisible(false)} onSuccess={handleCreateSuccess} />
      </Modal>
    </div>
  );
};

export default MissionPage;