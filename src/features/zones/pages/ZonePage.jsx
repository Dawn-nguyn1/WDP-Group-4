import React, { useState, useCallback, useRef, useEffect } from "react";
import { Tag, Spin, Button, Modal, notification, message } from "antd";
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import Map from "../../../shared/components/Map/Map";
import ZoneForm from "../components/ZoneForm";
import CheckPointForm from "../components/CheckPointForm";
import ZoneDetailDrawer from "../components/ZoneDetailDrawer";
import { fetchZonesAPI, deleteZoneAPI } from "../services/zoneApi";
import dayjs from "dayjs";
import styles from "../styles/ZonePage.module.css";

const ZonePage = ({ readOnly = false }) => {
  const [reloadZones, setReloadZones] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const reloadZonesRef = useRef(null);

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

  const fetchZonesList = async () => {
    setLoadingZones(true);
    try {
      const res = await fetchZonesAPI({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const apiZones = Array.isArray(res?.data) ? res.data : [];
      setZonesList(apiZones);
    } catch (error) {
      console.error("Fetch zones error:", error);
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
    message.info('Chức năng edit zone đang phát triển');
  };

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

      {/* Show CheckPointForm for both roles above the map */}
      <div style={{ marginBottom: "24px" }}>
        <CheckPointForm />
      </div>

      <Map
        onReloadCallback={handleReloadCallback}
        onZoneDeleted={handleZoneDeleted}
        onZoneClick={handleMapClick}
        onMapClickOutside={handleMapClickOutside}
        zonesList={zonesList}
        hoveredZoneId={hoveredZoneId}
        selectedZoneId={selectedZoneId}
        onZoneHover={handleZoneHover}
      />

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
        : zonesList.length === 0 ?
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            Chưa có vùng cấm bay nào
          </div>
        : <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "16px",
            }}
          >
            {zonesList.map((zone, index) => (
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
                  transform: hoveredZoneId === zone._id || selectedZoneId === zone._id ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
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
      </div>

      <ZoneDetailDrawer
        zoneId={selectedZoneId}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </div>
  );
};

export default ZonePage;
