import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Button,
  Input,
  notification,
  Modal,
  Select,
  Form,
  InputNumber,
  DatePicker,
  Tag,
} from "antd";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Polygon,
  useMap,
  Marker,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { createZoneAPI, fetchZonesAPI } from "../services/zoneApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const { Option } = Select;
const { TextArea } = Input;

// Component để invalidate map size khi modal mở
function MapResizeHandler({ isModalOpen }) {
  const map = useMap();

  useEffect(() => {
    if (isModalOpen) {
      // Đợi một chút để modal render hoàn toàn
      const timer1 = setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Invalidate lại sau khi modal animation hoàn tất
      const timer2 = setTimeout(() => {
        map.invalidateSize();
      }, 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [map, isModalOpen]);

  return null;
}

const ZoneForm = ({ loadZones }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Key để force re-render map
  const [form] = Form.useForm();
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [zonesList, setZonesList] = useState([]); // Danh sách zones từ API để hiển thị trên map
  const mapRef = useRef();
  const featureGroupRef = useRef();

  // Initial values được định nghĩa một lần để tránh re-render
  const initialValues = React.useMemo(
    () => ({
      type: "no_fly",
      minAltitude: 0,
      maxAltitude: 3000,
      effectiveFrom: dayjs(),
    }),
    [],
  );

  // Reset form và polygon khi đóng modal
  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setDrawnPolygon(null);
    setPolygonCoordinates([]);
    // Xóa các layer đã vẽ trên map
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    // Tăng key để force re-render map khi mở lại
    setMapKey((prev) => prev + 1);
  };

  // Fetch danh sách zones từ API để hiển thị trên map
  const fetchZonesList = async () => {
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
    }
  };

  // Xử lý khi modal mở
  const handleModalOpen = () => {
    setIsModalOpen(true);
    // Reset map key khi mở modal
    setMapKey((prev) => prev + 1);
    // Fetch zones khi mở modal để hiển thị trên map
    fetchZonesList();
  };

  // Xử lý khi vẽ polygon trên map
  const handleCreated = (e) => {
    const { layerType, layer } = e;

    if (layerType === "polygon") {
      const latlngs = layer.getLatLngs();

      if (latlngs && latlngs[0]) {
        // Chuyển đổi từ Leaflet LatLng sang format [lng, lat] cho GeoJSON
        const coordinates = latlngs[0].map((latlng) => [
          latlng.lng,
          latlng.lat,
        ]);
        // Đảm bảo polygon đóng (điểm đầu = điểm cuối)
        if (coordinates.length > 0) {
          const firstPoint = coordinates[0];
          const lastPoint = coordinates[coordinates.length - 1];
          if (
            firstPoint[0] !== lastPoint[0] ||
            firstPoint[1] !== lastPoint[1]
          ) {
            coordinates.push([firstPoint[0], firstPoint[1]]);
          }
        }

        setPolygonCoordinates(coordinates);
        setDrawnPolygon({
          type: "Polygon",
          coordinates: [coordinates],
        });

        notification.info({
          message: "Đã vẽ polygon",
          description: `Đã vẽ polygon với ${coordinates.length} điểm. Vui lòng điền thông tin và submit.`,
        });
      }
    } else if (layerType === "rectangle") {
      const bounds = layer.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        // Tạo polygon từ rectangle
        const coordinates = [
          [sw.lng, sw.lat],
          [ne.lng, sw.lat],
          [ne.lng, ne.lat],
          [sw.lng, ne.lat],
          [sw.lng, sw.lat], // Đóng polygon
        ];

        setPolygonCoordinates(coordinates);
        setDrawnPolygon({
          type: "Polygon",
          coordinates: [coordinates],
        });

        notification.info({
          message: "Đã vẽ rectangle",
          description:
            "Đã vẽ hình chữ nhật. Vui lòng điền thông tin và submit.",
        });
      }
    }
  };

  // Xử lý khi submit form
  const onFinish = async (values) => {
    // Kiểm tra đã vẽ polygon chưa
    if (!drawnPolygon || !polygonCoordinates.length) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng vẽ polygon trên bản đồ trước khi submit!",
      });
      return;
    }

    // Kiểm tra polygon hợp lệ (ít nhất 4 điểm để tạo polygon đóng)
    if (polygonCoordinates.length < 4) {
      notification.error({
        message: "Lỗi",
        description: "Polygon không hợp lệ! Cần ít nhất 3 điểm để tạo polygon.",
      });
      return;
    }

    // Kiểm tra maxAltitude >= minAltitude
    if (values.maxAltitude < values.minAltitude) {
      notification.error({
        message: "Lỗi",
        description: "Độ cao tối đa phải lớn hơn hoặc bằng độ cao tối thiểu!",
      });
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi lên API
      const zoneData = {
        name: values.name,
        description: values.description || "",
        type: values.type,
        geometry: {
          type: "Polygon",
          coordinates: [polygonCoordinates],
        },
        minAltitude: values.minAltitude,
        maxAltitude: values.maxAltitude,
        effectiveFrom:
          values.effectiveFrom ?
            dayjs(values.effectiveFrom).utc().format("YYYY-MM-DDTHH:mm:ss[Z]")
          : dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
      };

      console.log("Zone data to send:", zoneData);

      const res = await createZoneAPI(zoneData);

      // Kiểm tra response
      if (res && res._id) {
        notification.success({
          message: "Tạo zone thành công",
          description: `Đã tạo zone "${res.name}" thành công!`,
        });
        // Refresh danh sách zones
        await fetchZonesList();
        resetAndCloseModal();
        if (loadZones) {
          await loadZones();
        }
      } else {
        notification.error({
          message: "Lỗi tạo zone",
          description: "Không nhận được dữ liệu zone hợp lệ từ server",
        });
      }
    } catch (error) {
      console.error("Create zone error:", error);

      // Xử lý các loại lỗi khác nhau
      // Lưu ý: axios interceptor trả về error.response.data hoặc error gốc
      let errorMessage = "Tạo zone thất bại, vui lòng thử lại!";

      // Kiểm tra error có message không (từ interceptor)
      if (error?.message) {
        errorMessage = error.message;
      }
      // Kiểm tra error.response nếu interceptor không xử lý
      else if (error?.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage =
            error.response.data?.message ||
            "Dữ liệu không hợp lệ (thiếu field bắt buộc, polygon không hợp lệ, maxAltitude < minAltitude)";
        } else if (status === 401) {
          errorMessage = "Không được xác thực. Vui lòng đăng nhập lại!";
        } else if (status === 500) {
          errorMessage =
            error.response.data?.message || "Lỗi server. Vui lòng thử lại sau!";
        } else {
          errorMessage = error.response.data?.message || `Lỗi ${status}`;
        }
      }

      notification.error({
        message: "Lỗi tạo zone",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="zone-form" style={{ margin: "10px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Quản lý Vùng Cấm</h3>
        <Button onClick={handleModalOpen} type="primary" size="large">
          Tạo Vùng Cấm Mới
        </Button>
      </div>

      <Modal
        title="Tạo Vùng Cấm Mới"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => resetAndCloseModal()}
        maskClosable={false}
        okText="TẠO"
        cancelText="HỦY"
        width={900}
        style={{ top: 20 }}
        destroyOnClose={true}
        afterOpenChange={(open) => {
          // Invalidate map size sau khi modal mở hoàn toàn
          if (open && mapRef.current) {
            setTimeout(() => {
              const map = mapRef.current;
              if (map && map.invalidateSize) {
                map.invalidateSize();
              }
            }, 300);
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Form.Item
            label={
              <span>
                Tên Vùng Cấm <span style={{ color: "red" }}>*</span>
              </span>
            }
            name="name"
            rules={[
              { required: true, message: "Tên vùng cấm không được để trống!" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
              { max: 100, message: "Tên không quá 100 ký tự!" },
            ]}
          >
            <Input placeholder="Ví dụ: Tan Son Nhat Airport" size="large" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 500, message: "Mô tả không quá 500 ký tự!" }]}
          >
            <TextArea
              placeholder="Ví dụ: No-fly zone around Tan Son Nhat International Airport"
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Loại Vùng Cấm <span style={{ color: "red" }}>*</span>
              </span>
            }
            name="type"
            rules={[
              { required: true, message: "Loại vùng cấm không được để trống!" },
            ]}
          >
            <Select style={{ width: "100%" }} size="large">
              <Option value="no_fly">No Fly Zone</Option>
              <Option value="restricted">Restricted Zone</Option>
            </Select>
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              label={
                <span>
                  Độ Cao Tối Thiểu (m) <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="minAltitude"
              rules={[
                {
                  required: true,
                  message: "Độ cao tối thiểu không được để trống!",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Độ cao tối thiểu phải >= 0!",
                },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                placeholder="0"
                min={0}
                style={{ width: "100%" }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={
                <span>
                  Độ Cao Tối Đa (m) <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="maxAltitude"
              rules={[
                {
                  required: true,
                  message: "Độ cao tối đa không được để trống!",
                },
                { type: "number", min: 0, message: "Độ cao tối đa phải >= 0!" },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                placeholder="3000"
                min={0}
                style={{ width: "100%" }}
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            label={
              <span>
                Ngày Có Hiệu Lực <span style={{ color: "red" }}>*</span>
              </span>
            }
            name="effectiveFrom"
            rules={[
              {
                required: true,
                message: "Ngày có hiệu lực không được để trống!",
              },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Vẽ Polygon Trên Bản Đồ <span style={{ color: "red" }}>*</span>
              </span>
            }
            required
          >
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                overflow: "hidden",
                height: "400px",
                width: "100%",
              }}
            >
              {isModalOpen && (
                <MapContainer
                  center={[10.7769, 106.7009]}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                  ref={mapRef}
                  key={`zone-form-map-${mapKey}`}
                >
                  <MapResizeHandler isModalOpen={isModalOpen} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {/* Marker tọa độ hiện tại */}
                  <Marker position={[10.7769, 106.7009]}>
                    <Popup>Vị trí hiện tại: TP.HCM</Popup>
                  </Marker>

                  {/* Hiển thị các vùng cấm bay từ API */}
                  {zonesList.map((zone) => {
                    const ring = zone?.geometry?.coordinates?.[0];
                    if (!Array.isArray(ring)) return null;

                    const coordinates = ring
                      .map((pair) => {
                        const lng = pair?.[0];
                        const lat = pair?.[1];
                        if (typeof lat !== "number" || typeof lng !== "number")
                          return null;
                        return [lat, lng];
                      })
                      .filter(Boolean);

                    if (coordinates.length < 3) return null;

                    // Xác định màu dựa vào type của zone
                    const getZoneColor = (type) => {
                      if (type === "restricted") {
                        return "#ffd700"; // Màu vàng cho restricted zone
                      }
                      return "#ff0000"; // Màu đỏ cho no_fly zone
                    };

                    const zoneColor = getZoneColor(zone.type);

                    return (
                      <Polygon
                        key={zone._id}
                        positions={coordinates}
                        pathOptions={{
                          color: zoneColor,
                          fillColor: zoneColor,
                          fillOpacity: 0.2,
                          weight: 2,
                        }}
                      />
                    );
                  })}

                  {/* Hiển thị polygon đã vẽ */}
                  {drawnPolygon && polygonCoordinates.length > 0 && (
                    <Polygon
                      positions={polygonCoordinates.map((coord) => [
                        coord[1],
                        coord[0],
                      ])}
                      pathOptions={{
                        color: "#ff0000",
                        fillColor: "#ff0000",
                        fillOpacity: 0.3,
                        weight: 2,
                      }}
                    />
                  )}

                  {/* FeatureGroup để chứa các layer được vẽ */}
                  <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                      position="topleft"
                      onCreated={handleCreated}
                      draw={{
                        rectangle: false,
                        polygon: {
                          shapeOptions: {
                            color: "#ff0000",
                            fillColor: "#ff0000",
                            fillOpacity: 0.3,
                            weight: 2,
                          },
                          showArea: true,
                          showLength: true,
                        },
                        circle: false,
                        circlemarker: false,
                        marker: false,
                        polyline: false,
                      }}
                      edit={{
                        featureGroup: null,
                        remove: false,
                        edit: false,
                      }}
                    />
                  </FeatureGroup>
                </MapContainer>
              )}
            </div>
            <div style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>
              {polygonCoordinates.length > 0 ?
                <span style={{ color: "green" }}>
                  ✓ Đã vẽ polygon với {polygonCoordinates.length} điểm
                </span>
              : <span style={{ color: "red" }}>
                  ⚠ Vui lòng sử dụng công cụ vẽ ở góc trên bên trái bản đồ để
                  tạo polygon hoặc rectangle
                </span>
              }
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ZoneForm;
