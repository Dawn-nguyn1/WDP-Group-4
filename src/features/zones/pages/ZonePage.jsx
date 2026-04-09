import React, { useState, useCallback, useRef, useEffect } from "react";
import { Tag, Spin, Button, Modal, notification, message, Input, Select, Space, Card, Pagination } from "antd";
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, SearchOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import Map from "../../../shared/components/Map/Map";
import ZoneForm from "../components/ZoneForm";
import CheckPointForm from "../components/CheckPointForm";
import ZoneDetailDrawer from "../components/ZoneDetailDrawer";
import ZoneEditModal from "../components/Zone.Edit.Modal";
import { fetchZonesAPI, deleteZoneAPI } from "../services/zoneApi";
import dayjs from "dayjs";
import styles from "../styles/ZonePage.module.css";

const { Search } = Input;
const { Option } = Select;

const ZonePage = ({ readOnly = false }) => {
  const [reloadZones, setReloadZones] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const reloadZonesRef = useRef(null);

  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('active'); // Default to active only
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 9  // Mặc định 9 vùng cấm bay cho 1 trang
  });

  const handleZoneHover = useCallback((zoneId) => {
    console.log('=== ZONE HOVER ===');
    console.log('Hovered zone ID:', zoneId);
    console.log('Current hovered zone ID:', hoveredZoneId);
    setHoveredZoneId(zoneId);
    console.log('=== END ZONE HOVER ===');
  }, [hoveredZoneId]);

  const handleReloadCallback = useCallback((fetchFunction) => {
    if (fetchFunction && typeof fetchFunction === "function") {
      reloadZonesRef.current = fetchFunction;
      setReloadZones(() => fetchFunction);
    }
  }, []);

  const fetchZonesList = async (page = 1) => {
    setLoadingZones(true);
    try {
      const params = {
        page: page,
        limit: pagination.limit,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      // Add search text if exists
      if (searchText.trim()) {
        params.search = searchText.trim();
      }

      // Add filters if selected
      if (filterStatus) {
        params.status = filterStatus;
      }

      if (filterType) {
        params.type = filterType;
      }
            
      const res = await fetchZonesAPI(params);
      
      const apiZones = Array.isArray(res?.data) ? res.data : [];
      setZonesList(apiZones);
      
      // Update pagination if available
      if (res?.pagination) {
        setPagination(prev => ({
          ...prev,
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalCount: res.pagination.totalCount,
        }));
      }
    } catch (error) {
      console.error('❌ Fetch zones error:', error);
      message.error('Không thể tải danh sách zones');
      setZonesList([]);
    } finally {
      setLoadingZones(false);
    }
  };

  useEffect(() => {
    fetchZonesList();
  }, []);

  const handleZoneCreated = async () => {
    await fetchZonesList();
    if (reloadZonesRef.current) {
      await reloadZonesRef.current();
    }
  };

  const handleZoneDeleted = async () => {
    await fetchZonesList();
    if (reloadZonesRef.current) {
      await reloadZonesRef.current();
    }
  };

  const handleDeleteZone = (zone) => {
    Modal.confirm({
      title: "Xác nhận xóa vùng cấm bay",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa vùng cấm bay "${zone.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await deleteZoneAPI(zone._id);
          if (res && res.message) {
            notification.success({
              message: "Xóa zone thành công",
              description: `Đã archive zone "${zone.name}" thành công!`,
            });
            await fetchZonesList();
            if (reloadZonesRef.current) await reloadZonesRef.current();
          }
        } catch (error) {
          notification.error({
            message: "Lỗi xóa zone",
            description: error?.message || "Xóa zone thất bại!",
          });
        }
      },
    });
  };

  const handleZoneClick = (zoneId) => {
    console.log('=== ZONE CLICK ===');
    console.log('Clicked zone ID:', zoneId);
    setSelectedZoneId(zoneId);
    setDrawerVisible(true);
  };

  const handleMapClick = (zoneId) => {
    console.log('=== MAP CLICK ===');
    console.log('Clicked zone on map:', zoneId);
    setSelectedZoneId(zoneId);
    setHoveredZoneId(zoneId);
  };

  const handleMapClickOutside = () => {
    console.log('=== MAP CLICK OUTSIDE ===');
    setSelectedZoneId(null);
    setHoveredZoneId(null);
  };

  const handleEditZone = (zone) => {
    console.log('=== EDIT ZONE ===');
    console.log('Zone to edit:', zone);
    setEditingZoneId(zone._id);
    setEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    setEditingZoneId(null);
  };

  const handleEditSuccess = (updatedZone) => {
    console.log('=== EDIT SUCCESS ===');
    console.log('Updated zone:', updatedZone);
    // Refresh zones list
    fetchZonesList();
    // Refresh map zones if callback exists
    if (reloadZonesRef.current) {
      reloadZonesRef.current();
    }
  };

  // Search and filter handlers
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleFilterStatus = (value) => {
    setFilterStatus(value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleFilterType = (value) => {
    setFilterType(value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSortBy = (value) => {
    setSortBy(value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSortOrder = (value) => {
    setSortOrder(value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilterStatus('active'); // Reset to active only
    setFilterType('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Pagination handler
  const handlePageChange = (page, pageSize) => {
    console.log('📄 Page change:', { page, pageSize });
    setPagination(prev => ({ ...prev, currentPage: page, limit: pageSize }));
    fetchZonesList(page);
  };

  // Filter zones for display - only show active zones by default
  const getFilteredZonesForDisplay = () => {
    // If no status filter is set, default to active only
    if (!filterStatus) {
      return zonesList.filter(zone => zone.status === 'active');
    }
    return zonesList;
  };

  const filteredZonesForDisplay = getFilteredZonesForDisplay();

  // Fetch zones when search/filter/sort changes
  useEffect(() => {
    fetchZonesList(1);
  }, [searchText, filterStatus, filterType, sortBy, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Zone Management</h1>
        <p className={styles.subtitle}>
          {readOnly ?
            "View no-fly zones on the map"
          : "Manage and draw no-fly zones on the map"}
        </p>
      </div>

      {!readOnly && (
        <div style={{ marginBottom: "24px" }}>
          <ZoneForm loadZones={handleZoneCreated} />
        </div>
      )}

      {/* Show CheckPointForm for both roles above the map - HIDDEN */}
      {/* <div style={{ marginBottom: "24px" }}>
        <CheckPointForm />
      </div> */}

      {/* Map Container */}
      <Card 
        style={{ 
          marginBottom: "24px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #d9d9d9"
        }}
        bodyStyle={{ padding: "0" }}
      >
        <Map
          onReloadCallback={handleReloadCallback}
          onZoneDeleted={handleZoneDeleted}
          onZoneClick={handleMapClick}
          onMapClickOutside={handleMapClickOutside}
          zonesList={filteredZonesForDisplay}
          hoveredZoneId={hoveredZoneId}
          selectedZoneId={selectedZoneId}
          onZoneHover={handleZoneHover}
        />
      </Card>

      {/* Search and Filter Controls */}
      <Card style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
            <FilterOutlined /> Tìm kiếm & Lọc
          </h3>
        </div>
        
        <Space wrap size="middle" style={{ width: "100%" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <Search
              placeholder="Tìm kiếm theo tên zone..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
            />
          </div>

          {/* Status Filter */}
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 120 }}
            value={filterStatus || undefined}
            onChange={handleFilterStatus}
            size="middle"
          >
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Không hoạt động</Option>
            <Option value="archived">Đã lưu trữ</Option>
          </Select>

          {/* Type Filter */}
          <Select
            placeholder="Loại zone"
            allowClear
            style={{ width: 120 }}
            value={filterType || undefined}
            onChange={handleFilterType}
            size="middle"
          >
            <Option value="no_fly">Cấm bay</Option>
            <Option value="restricted">Hạn chế</Option>
            <Option value="warning">Cảnh báo</Option>
          </Select>

          {/* Sort By */}
          <Select
            placeholder="Sắp xếp theo"
            style={{ width: 140 }}
            value={sortBy}
            onChange={handleSortBy}
            size="middle"
          >
            <Option value="createdAt">Ngày tạo</Option>
            <Option value="updatedAt">Ngày cập nhật</Option>
            <Option value="name">Tên zone</Option>
            <Option value="type">Loại zone</Option>
            <Option value="minAltitude">Độ cao tối thiểu</Option>
            <Option value="maxAltitude">Độ cao tối đa</Option>
          </Select>

          {/* Sort Order */}
          <Select
            style={{ width: 100 }}
            value={sortOrder}
            onChange={handleSortOrder}
            size="middle"
          >
            <Option value="desc">Giảm dần</Option>
            <Option value="asc">Tăng dần</Option>
          </Select>

          {/* Clear Filters */}
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            size="middle"
          >
            Xóa bộ lọc
          </Button>
        </Space>

        {/* Results Summary */}
        <div style={{ marginTop: 12, fontSize: "12px", color: "#666" }}>
          Hiển thị <strong>{filteredZonesForDisplay.length}</strong> của <strong>{pagination.totalCount}</strong> zones
          {searchText && ` cho "${searchText}"`}
          {filterStatus && ` • Trạng thái: ${filterStatus}`}
          {filterType && ` • Loại: ${filterType}`}
          {` • Trang ${pagination.currentPage}/${pagination.totalPages || 1}`}
        </div>
      </Card>

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "bold" }}
        >
          Danh Sách Vùng Cấm Bay
        </h2>
        {loadingZones ?
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        : filteredZonesForDisplay.length === 0 ?
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            Chưa có vùng cấm bay nào
          </div>
        : <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "16px",
              maxWidth: "1200px", // Max width for 3 columns
              margin: "0 auto" // Center the grid
            }}
          >
            {filteredZonesForDisplay.map((zone, index) => (
              <div
                key={zone._id}
                style={{
                  padding: "16px",
                  border:
                    hoveredZoneId === zone._id || selectedZoneId === zone._id ?
                      "3px solid #1890ff"
                    : "1px solid #e8e8e8",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow:
                    hoveredZoneId === zone._id || selectedZoneId === zone._id ?
                      "0 8px 24px rgba(24, 144, 255, 0.3)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transform: hoveredZoneId === zone._id || selectedZoneId === zone._id ? "scale(1.02)" : "scale(1)",
                  margin: hoveredZoneId === zone._id || selectedZoneId === zone._id ? "-4px" : "0",
                }}
                onMouseEnter={() => {
                  console.log('=== ZONE CARD HOVER ENTER ===');
                  console.log('Zone ID:', zone._id);
                  console.log('Zone Name:', zone.name);
                  setHoveredZoneId(zone._id);
                }}
                onMouseLeave={() => {
                  console.log('=== ZONE CARD HOVER LEAVE ===');
                  console.log('Zone ID:', zone._id);
                  if (selectedZoneId !== zone._id) {
                    setHoveredZoneId(null);
                  }
                }}
                onClick={() => handleZoneClick(zone._id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        marginBottom: "6px",
                        color: "#1890ff",
                      }}
                    >
                      {index + 1}. {zone.name}
                    </div>
                    {zone.description && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        {zone.description}
                      </div>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", marginLeft: "12px" }}
                  >
                    <Tag color={zone.status === "active" ? "green" : "default"}>
                      {zone.status === "active" ?
                        "Hoạt động"
                      : "Không hoạt động"}
                    </Tag>
                    <Tag
                      color={
                        zone.type === "no_fly" ? "red"
                        : zone.type === "restricted" ?
                          "orange"
                        : "blue"
                      }
                    >
                      {zone.type === "no_fly" ?
                        "Cấm bay"
                      : zone.type === "restricted" ?
                        "Hạn chế"
                      : "Cảnh báo"}
                    </Tag>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#666",
                    paddingTop: "12px",
                    borderTop: "1px solid #e8e8e8",
                  }}
                >
                  <div>
                    <strong>Độ cao:</strong> {zone.minAltitude}m -{" "}
                    {zone.maxAltitude}m
                  </div>
                  <div>
                    <strong>Ngày tạo:</strong>{" "}
                    {dayjs(zone.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
                {!readOnly && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: "12px",
                      borderTop: "1px solid #e8e8e8",
                      marginTop: "12px",
                      gap: "8px",
                    }}
                  >
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditZone(zone);
                      }}
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(zone);
                      }}
                      size="small"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        }

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ textAlign: "right", marginTop: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "20px" }}>
              <Pagination
                current={pagination.currentPage}
                total={pagination.totalCount}
                pageSize={pagination.limit}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `Hiển thị ${range[0]}-${range[1]} của ${total} zones`
                }
                pageSizeOptions={['9', '18', '27', '36']}
                locale={{
                  items_per_page: 'zones/trang',
                  jump_to: 'Đến trang',
                  jump_to_confirm: 'Xác nhận',
                  page: '',
                  prev_page: 'Trang trước',
                  next_page: 'Trang sau',
                  prev_5: '5 trang trước',
                  next_5: '5 trang sau',
                  prev_3: '3 trang trước',
                  next_3: '3 trang sau'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <ZoneDetailDrawer
        zoneId={selectedZoneId}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      <ZoneEditModal
        visible={editModalVisible}
        onCancel={handleEditModalCancel}
        zoneId={editingZoneId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default ZonePage;
