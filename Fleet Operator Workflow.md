# Fleet Operator Workflow

## Luông Hoat Dong Cho Role Fleet Operator

### B1: Tao Drone
- Tao drone moi trong he thong
- Cau hinh thong so drone

### B2: Tao Duong Bay (Flight Plans)
- Tao nhieu duong bay khac nhau
- Cau hinh waypoints, thong so cho tung duong bay

### B3: Tao Mission Trong (DRAFT)
- Tao mission moi voi trang thai DRAFT
- Mission chua co flight plan gan vao

### B4: Gan Flight Plan vao Mission
- Vao "Mission Plans" de gan flight plan da co vao mission
- Chon flight plan phu hop cho mission

### B5: Bat Dau Mission Plan
- Start mission plans
- Trang thai mission plan: SCHEDULED
- Trang thai mission: ACTIVE

### B6: Gia Lap (Chua Thuc Hien)
- Khi mission san sang, den gio bay du kien:
  - Trạng thái drone sẽ thay đổi (ACTIVE -> FLYING)
  - Trạng thái flight plan sẽ thay đổi (ACTIVE -> IN_PROGRESS)
  - **Giải pháp**: Dùng Flight Plan Follower Simulator
 
#### Cách áp dụng Flight Plan Follower Simulator:
 
**B1: Input cho Simulator:**
- `missionPlanId` (từ B5)
- Hoặc `flightPlanId` (từ flight plan gán vào mission)
 
**B2: Simulator Flow:**
1. Nhận `missionPlanId` -> Lấy `flightPlanId` và `droneId`
2. Đọc danh sách `waypoints` từ flight plan
3. Tạo `flightSession` mới (hoặc dùng session có sẵn)
4. Nội suy vị trí theo `speed` (10 m/s) và `estimatedTime`
5. Gửi telemetry qua WebSocket:
   ```
   {
     sessionId: "xxx",
     droneId: "xxx", 
     latitude: current_lat,
     longitude: current_lng,
     altitude: current_alt,
     speed: current_speed,
     battery: current_battery,
     timestamp: ISO_string
   }
   ```
**B3: Cập nhật Status:**
- **Drone Status**: ACTIVE -> FLYING -> LANDED
- **Flight Plan Status**: ACTIVE -> IN_PROGRESS -> COMPLETED
- **Mission Plan Status**: SCHEDULED -> IN_PROGRESS -> COMPLETED
 
**B4: Các mode nên có:**
1. `follow-plan`: Bay bám waypoint (normal)
2. `deviation-test`: Lệch route (test DEVIATION alert)
3. `battery-drop`: Giảm pin nhanh (test BATTERY_LOW)
 
#### Implementation Steps:
 
**Step 1: Tạo Simulator Service**
```javascript
// src/simulators/flightPlanFollower.js
class FlightPlanFollower {
  async startSimulation(missionPlanId) {
    // 1. Lấy mission plan info
    // 2. Lấy flight plan waypoints  
    // 3. Tạo flight session
    // 4. Bắt đầu gửi telemetry
  }
}   
Step 2: Tạo API Endpoint

javascript
// POST /api/simulators/start-flight-plan
{
  missionPlanId: "xxx",
  mode: "follow-plan" // or "deviation-test"
}
Step 3: Tích hợp với Mission Flow

Khi start mission plan (B5) -> tạo simulator
Simulator tự động chạy khi đến estimatedTime
Cập nhật status real-time
Step 4: Frontend Integration

Nút "Start Simulation" trong Mission Plans
Real-time map updates từ telemetry
Status indicators cho drone/flight plan/mission
Files cần chỉnh sửa/thêm:
src/simulators/flightPlanFollower.js (mới)
src/api/simulatorController.js (mới)
src/routes/simulator.routes.js (mới)
src/features/missions/pages/MissionPlansPage.jsx (update)
src/config/websocket.js (verify format)

## Luong Tong Quan

```
Tao Drone -> Tao Flight Plans -> Tao Mission (DRAFT) -> 
Gan Flight Plan vao Mission -> Start Mission Plan -> 
[SCHEDULED + ACTIVE] -> Gia Lap Drone Bay
```

## Trang Thai Quan Trong

- **Mission Plan Status**: SCHEDULED (khi start)
- **Mission Status**: ACTIVE (khi start)
- **Drone Status**: Se thay doi khi bat dau bay
- **Flight Plan Status**: Se thay doi khi bat dau bay



# #######################################################################################
## Flight Plan Creation - Pin Calculation

### Input Required:
- Drone selection
- Pin du kien su dung (%)
- Thoi gian bay du kien (phut)
- Ghi chu
- Waypoint information

### Pin Calculation Logic:
- **Công thuc**: 1km = 1% pin
- **Cách tính quãng dung**: Dùng công thuc Haversine
- **Speed hiên tai**: Cofdinh là 10 m/s (dong 92 trong WaypointEditorWithZones.jsx)
- **Input speed**: Hiên tai bi an (dong 773-784)

### 2 Cách Tính Quãng Duong:

#### Cách 1: Tinh toán truc tiep (Khuyên dùng)
- Dùng công thuc Haversine tính khoang cách giua 2 waypoints
- Cong dôn tât ca các doan
- Nhanh, don gian, k can simulator

#### Cách 2: Dung Flight Plan Follower Simulator
- Simulator chay theo waypoints và ghi lai quãng duong thuc te
- Chính xác hon (tinh duong cong)
- Can simulator

### Implementation Plan:
1. Them function tính khoang cách Haversine
2. Tính tong quãng duong from waypoints
3. Tû dông câp nhât % pin
4. Hiên lai input speed

## Ghi Chu

- Luong sau B5 chua duoc trien khai do can giai lap
- Can co giai lap de drone tu dong bay den gio va cap nhat trang thái
- Speed waypoint hiên tai cofdinh 10 m/s, can hiên lai input de nguoi dung dieu chinh
