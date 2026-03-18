import React, { useState } from 'react';
import { Card, Typography, Button, Modal, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import MissionTable from '../MissionTable';
import MissionForm from '../MissionForm';
import MissionPlans from '../../missionsplans/Missonplans';

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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Quản lý Missions
        </Title>
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
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Danh sách Missions" key="missions">
          <MissionTable />
        </TabPane>
        <TabPane tab="Mission Plans" key="missionPlans">
          <MissionPlans />
        </TabPane>
      </Tabs>

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