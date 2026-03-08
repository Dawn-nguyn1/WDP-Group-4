# Implementation Plan — UTM Drone Management FE

> **Project**: WDP-Group-4 (React 19 + Vite 7 + Ant Design 6 + Leaflet)
> **BE**: WDP301_BE (Node.js + Express + MongoDB)
> **Last updated**: 2026-03-09 (Phase 0 ✅)

---

## Mục lục

- [Gap Analysis](#gap-analysis)
- [Phase 0: Feature-Based Architecture Refactor](#phase-0-feature-based-architecture-refactor)
- [Phase 1: Foundation APIs](#phase-1-foundation-apis)
- [Phase 2: Drones CRUD](#phase-2-drones-crud)
- [Phase 3: Flight Plans & Conflicts](#phase-3-flight-plans--conflicts)
- [Phase 4: Flight Sessions & Realtime](#phase-4-flight-sessions--realtime)
- [Phase 5: Polish & Navigation](#phase-5-polish--navigation)

---

## Gap Analysis

### ✅ Đã implement (3/9 API groups)

| API Group           | Endpoints                                                          | FE Status              |
| :------------------ | :----------------------------------------------------------------- | :--------------------- |
| **Auth**            | `POST /register`, `POST /login`, `POST /logout`                    | Có pages + API         |
| **Admin Users**     | `GET/POST /api/admin/users`, `GET/PUT/DELETE /api/admin/users/:id` | Có table + form + CRUD |
| **Zones** (partial) | `GET /api/zones`, `POST /api/zones`, `DELETE /api/zones/:id`       | Có form + map + list   |

### ❌ Chưa implement (6/9 API groups)

| #   | API Group                                                 | Số endpoints | Priority |
| :-- | :-------------------------------------------------------- | :----------- | :------- |
| 1   | **User Profile** (`/api/users/me`)                        | 3            | Phase 1  |
| 2   | **Zones** remaining (`GET/:id`, `PUT/:id`, `POST /check`) | 3            | Phase 1  |
| 3   | **Drones** (full CRUD)                                    | 5            | Phase 2  |
| 4   | **Flight Plans** + lifecycle                              | 8            | Phase 3  |
| 5   | **Conflicts** (admin)                                     | 3            | Phase 3  |
| 6   | **Flight Sessions**                                       | 9            | Phase 4  |
| 7   | **Telemetry** (REST + Socket.IO)                          | 3            | Phase 4  |
| 8   | **Alerts**                                                | 3            | Phase 4  |

### Bugs hiện tại

- ~~`getAccountAPI()` trong `api.service.js` URL rỗng~~ → ✅ Replaced with `getMyProfileAPI()` in `authApi.js`
- ~~`flycam.*` components đều là empty stubs~~ → ✅ Deleted
- ~~`map.jsx` nằm trong `components/user/`~~ → ✅ Moved to `shared/components/Map/Map.jsx`
- ~~`zone.jsx` page import `user.css`~~ → ✅ Each feature has own styles
- ~~Axios interceptor 6 nhánh if-else~~ → ✅ Simplified: always returns `response.data`

---

## Phase 0: Feature-Based Architecture Refactor ✅

> **Status**: Hoàn thành — `npm run build` thành công (exit code 0)

### Mục tiêu

Chuyển từ type-based structure → feature-based architecture, thêm Redux, CSS Modules, và role-based routing.

### Cấu trúc thư mục mới

```
src/                                          # 36 files total
├── app/
│   ├── App.jsx                       # Root component (chỉ <Outlet />)
│   ├── store.js                      # Redux configureStore + DevTools
│   └── router.jsx                    # Central router (role-based)
│
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Redux dispatch loginUser thunk
│   │   │   └── RegisterPage.jsx      # Redux dispatch registerUser thunk
│   │   ├── services/
│   │   │   └── authApi.js            # login, register, logout, getMyProfile, etc.
│   │   ├── slices/
│   │   │   └── authSlice.js          # Thay thế AuthContext
│   │   └── styles/
│   │       ├── LoginPage.css         # Giữ global CSS (Ant Design deep selectors)
│   │       └── RegisterPage.css
│   │
│   ├── dashboard/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Stats cards (users, zones, conflicts, sessions)
│   │   │   └── OperatorDashboard.jsx # Stats cards (drones, plans, sessions, zones)
│   │   └── styles/
│   │       ├── AdminDashboard.module.css
│   │       └── OperatorDashboard.module.css
│   │
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserTable.jsx
│   │   │   ├── UserForm.jsx
│   │   │   ├── UserDetail.jsx
│   │   │   └── UpdateUserModal.jsx
│   │   ├── pages/
│   │   │   └── UserPage.jsx
│   │   ├── services/
│   │   │   └── userApi.js
│   │   ├── data/
│   │   │   └── mockUsers.js
│   │   └── styles/
│   │       └── UserPage.css          # Giữ global CSS (table className strings)
│   │
│   ├── zones/
│   │   ├── components/
│   │   │   └── ZoneForm.jsx
│   │   ├── pages/
│   │   │   └── ZonePage.jsx          # Có prop `readOnly` cho operator
│   │   ├── services/
│   │   │   └── zoneApi.js
│   │   └── styles/
│   │       └── ZonePage.module.css
│   │
│   ├── drones/                       # → Phase 2 (chưa tạo)
│   ├── flight-plans/                 # → Phase 3 (chưa tạo)
│   ├── conflicts/                    # → Phase 3 (chưa tạo)
│   ├── flight-sessions/              # → Phase 4 (chưa tạo)
│   └── alerts/                       # → Phase 4 (chưa tạo)
│
├── shared/
│   ├── components/
│   │   └── Map/
│   │       └── Map.jsx               # Moved from components/user/
│   ├── guards/
│   │   └── ProtectedRoute.jsx        # Auth + role check + auto-fetch user
│   ├── layouts/
│   │   ├── AdminLayout/
│   │   │   ├── AdminLayout.jsx       # Sidebar: Dashboard, Users, Zones, Conflicts
│   │   │   └── AdminLayout.module.css
│   │   └── OperatorLayout/
│   │       ├── OperatorLayout.jsx    # Sidebar: Dashboard, Drones, Plans, Sessions, Zones
│   │       └── OperatorLayout.module.css
│   ├── services/
│   │   └── axios.js                  # Simplified interceptor
│   └── styles/
│       └── global.css                # CSS reset + design tokens
│
├── assets/
│   └── OIP.jpg, react.svg
│
└── main.jsx                          # Redux Provider + RouterProvider
```

### Step 0.1 — Install dependencies

```bash
npm install @reduxjs/toolkit react-redux
```

### Step 0.2 — File migration map

| File cũ                                 | → Đích mới                                                                        | Action                      |
| :-------------------------------------- | :-------------------------------------------------------------------------------- | :-------------------------- |
| `services/axios.customize.js`           | `shared/services/axios.js`                                                        | Move + refactor interceptor |
| `services/api.service.js`               | _(xóa)_ → tách thành 3 file dưới                                                  | Split                       |
| ↳ auth functions                        | `features/auth/services/authApi.js`                                               | Extract                     |
| ↳ user functions                        | `features/users/services/userApi.js`                                              | Extract                     |
| ↳ zone functions                        | `features/zones/services/zoneApi.js`                                              | Extract                     |
| `context/auth.context.jsx`              | _(xóa)_ → `features/auth/slices/authSlice.js`                                     | Replace with Redux          |
| `components/user/map.jsx`               | `shared/components/Map/Map.jsx`                                                   | Move                        |
| `components/user/user.jsx`              | `features/users/pages/UserPage.jsx`                                               | Move                        |
| `components/user/user.table.jsx`        | `features/users/components/UserTable.jsx`                                         | Move                        |
| `components/user/user.form.jsx`         | `features/users/components/UserForm.jsx`                                          | Move                        |
| `components/user/user.detail.jsx`       | `features/users/components/UserDetail.jsx`                                        | Move                        |
| `components/user/update.user.modal.jsx` | `features/users/components/UpdateUserModal.jsx`                                   | Move                        |
| `components/user/user.data.js`          | `features/users/data/mockUsers.js`                                                | Move                        |
| `components/user/user.css`              | `features/users/styles/UserPage.css`                                              | Move (giữ global CSS)       |
| `components/zone/zone.form.jsx`         | `features/zones/components/ZoneForm.jsx`                                          | Move + fix imports          |
| `pages/zone.jsx`                        | `features/zones/pages/ZonePage.jsx`                                               | Rewrite (thêm `readOnly`)   |
| `pages/login.jsx`                       | `features/auth/pages/LoginPage.jsx`                                               | Rewrite (Redux)             |
| `pages/register.jsx`                    | `features/auth/pages/RegisterPage.jsx`                                            | Rewrite (Redux)             |
| `pages/styles/login.css`                | `features/auth/styles/LoginPage.css`                                              | Move + fix asset URLs       |
| `pages/styles/register.css`             | `features/auth/styles/RegisterPage.css`                                           | Move + fix asset URLs       |
| `pages/homepage.jsx`                    | _(xóa)_ → `features/dashboard/pages/AdminDashboard.jsx` + `OperatorDashboard.jsx` | Split into 2 (new)          |
| `components/layout/header.jsx`          | _(xóa)_ → Integrated into AdminLayout/OperatorLayout sidebars                     | Replaced by layouts         |
| `components/layout/footer.jsx`          | _(xóa)_ → Not needed with sidebar layouts                                         | Deleted                     |
| `components/layout/footer.css`          | _(xóa)_                                                                           | Deleted                     |
| `components/flycam/*`                   | _(xóa toàn bộ 6 files)_                                                           | Deleted ✅                  |
| `App.jsx`                               | `app/App.jsx` (new minimal)                                                       | Rewritten                   |
| `main.jsx`                              | `main.jsx`                                                                        | Rewritten (Redux + Router)  |

### Step 0.3 — Redux Store setup

**`app/store.js`**:

```js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // users, zones... thêm sau
  },
  devTools: process.env.NODE_ENV !== "production", // Redux DevTools
});
```

**`features/auth/slices/authSlice.js`** — thay thế `AuthContext`:

```js
// State shape:
{
  user: { _id, email, profile: { fullName }, role },
  token: null,
  isLoading: false,
  isAuthenticated: false,
}

// Async thunks:
loginUser(email, password)     // POST /api/auth/login → save token + user
registerUser(...)              // POST /api/auth/register
logoutUser()                   // POST /api/auth/logout → clear state
fetchCurrentUser()             // GET /api/users/me → refresh user info

// Extra reducers:
loginUser.fulfilled  → set user + token + isAuthenticated
logoutUser.fulfilled → clear all
```

**`main.jsx`** — wrap với Provider:

```jsx
import { Provider } from "react-redux";
import { store } from "./app/store";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
);
```

### Step 0.4 — Role-based routing

**`app/router.jsx`**:

```
Public routes (không cần login):
  /login              → LoginPage
  /register           → RegisterPage

Admin routes (UTM_ADMIN only):
  /admin              → AdminLayout wrapper
    /admin/dashboard  → AdminDashboard
    /admin/users      → UserPage (CRUD)
    /admin/zones      → ZonePage (CRUD)
    /admin/conflicts  → (Phase 3)

Operator routes (FLEET_OPERATOR only):
  /operator               → OperatorLayout wrapper
    /operator/dashboard   → OperatorDashboard
    /operator/zones       → ZonePage (read-only)
    /operator/drones      → (Phase 2)
    /operator/flight-plans    → (Phase 3)
    /operator/flight-sessions → (Phase 4)
```

**`shared/guards/ProtectedRoute.jsx`**:

```jsx
// Kiểm tra:
// 1. isAuthenticated (có token trong Redux?) → redirect /login
// 2. allowedRoles.includes(user.role) → redirect /unauthorized
```

**Layouts**:

- `AdminLayout`: Sidebar trái (Dashboard, Users, Zones, Conflicts) + Header + Content area
- `OperatorLayout`: Sidebar trái (Dashboard, Drones, Flight Plans, Sessions, Zones) + Header + Content area

### Step 0.5 — CSS Modules migration

CSS Modules áp dụng cho **new components** (layouts, dashboards, zones page). Giữ **regular CSS** cho:

- `users/styles/UserPage.css` → UserTable dùng nhiều bare className strings
- `auth/styles/LoginPage.css`, `RegisterPage.css` → Ant Design deep selectors + `!important`

```jsx
// Layouts, dashboards (CSS Modules):
import styles from './AdminLayout.module.css';
<div className={styles.layout}>

// User/auth pages (regular CSS):
import '../styles/UserPage.css';
<div className="user-page-container">
```

`shared/styles/global.css` chứa:

- CSS reset (`*`, `*::before/after`)
- CSS custom properties (design tokens: `--color-primary`, `--spacing-*`, `--radius-*`, `--shadow-*`)
- Body defaults

### Step 0.6 — Axios interceptor refactor

```js
// shared/services/axios.js — Đơn giản hóa

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request: attach JWT token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: luôn return response.data
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  },
);
```

Mỗi feature API service tự xử lý response structure rõ ràng:

```js
// features/zones/services/zoneApi.js
export const fetchZones = (params) => axios.get("/api/zones", { params });
// Response đã là: { data: [...], pagination: {...} }
```

---

## Phase 1: Foundation APIs

> Prerequisites: Phase 0 hoàn thành

### 1.1 User Profile (`/api/users/me`)

| File                                           | Nội dung                                                                      |
| :--------------------------------------------- | :---------------------------------------------------------------------------- |
| `features/users/services/userApi.js`           | Thêm `getMyProfile()`, `updateMyProfile(data)`, `deleteMyAccount()`           |
| `features/users/slices/userSlice.js`           | Thêm async thunks cho profile operations                                      |
| `features/users/pages/ProfilePage.jsx`         | **[NEW]** Trang profile cá nhân (xem + sửa fullName, avatar, phone, password) |
| `features/users/styles/ProfilePage.module.css` | **[NEW]** Styles                                                              |

Route: `/admin/profile` và `/operator/profile`

### 1.2 Remaining Zone APIs

| File                                           | Nội dung                                                                           |
| :--------------------------------------------- | :--------------------------------------------------------------------------------- |
| `features/zones/services/zoneApi.js`           | Thêm `getZoneDetail(id)`, `updateZone(id, data)`, `checkPoint(lat, lng, altitude)` |
| `features/zones/components/ZoneDetail.jsx`     | **[NEW]** Modal/page xem + sửa chi tiết zone                                       |
| `features/zones/components/CheckPointForm.jsx` | **[NEW]** Form kiểm tra điểm có nằm trong zone không                               |

### 1.3 Drone API services (chuẩn bị cho Phase 2)

| File                                   | Nội dung                                                                                                     |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `features/drones/services/droneApi.js` | **[NEW]** `createDrone()`, `fetchDrones()`, `getDroneDetail(id)`, `updateDrone(id, data)`, `deleteDrone(id)` |
| `features/drones/slices/droneSlice.js` | **[NEW]** Redux slice cho drone state                                                                        |

---

## Phase 2: Drones CRUD

> Prerequisites: Phase 1 hoàn thành (drone API services ready)

### Tạo UI components cho Drones

| File                                              | Nội dung                                                                    |
| :------------------------------------------------ | :-------------------------------------------------------------------------- |
| `features/drones/pages/DronePage.jsx`             | **[NEW]** Trang quản lý drones (list + create + delete)                     |
| `features/drones/components/DroneTable.jsx`       | **[NEW]** Bảng danh sách drones (model, serial, status, actions)            |
| `features/drones/components/DroneForm.jsx`        | **[NEW]** Modal tạo drone mới (serialNumber, model, ownerType, maxAltitude) |
| `features/drones/components/DroneDetail.jsx`      | **[NEW]** Chi tiết drone                                                    |
| `features/drones/components/UpdateDroneModal.jsx` | **[NEW]** Modal sửa drone                                                   |
| `features/drones/styles/DronePage.module.css`     | **[NEW]** Styles                                                            |

Route: `/operator/drones`

### Drone Data Model (từ BE)

```
serialNumber: string (required)
model: string (required)
ownerType: "INDIVIDUAL" | "FLEET"
maxAltitude: number
status: "IDLE" | "FLYING" | "MAINTENANCE" | "OFFLINE"
```

---

## Phase 3: Flight Plans & Conflicts

> Prerequisites: Phase 2 hoàn thành (cần chọn drone khi tạo flight plan)

### 3.1 Flight Plan Module

| File                                                   | Nội dung                                                                                |
| :----------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `features/flight-plans/services/flightPlanApi.js`      | **[NEW]** Tất cả flight plan endpoints                                                  |
| `features/flight-plans/slices/flightPlanSlice.js`      | **[NEW]** Redux slice                                                                   |
| `features/flight-plans/pages/FlightPlanListPage.jsx`   | **[NEW]** Danh sách plans (filter by status: DRAFT/PENDING/APPROVED/REJECTED/CANCELLED) |
| `features/flight-plans/pages/FlightPlanDetailPage.jsx` | **[NEW]** Chi tiết plan + conflicts + map visualization                                 |
| `features/flight-plans/components/FlightPlanForm.jsx`  | **[NEW]** Form tạo/sửa plan (chọn drone, thời gian, waypoints)                          |
| `features/flight-plans/components/WaypointEditor.jsx`  | **[NEW]** Editor waypoints trên map (drag & drop markers)                               |
| `features/flight-plans/components/ConflictViewer.jsx`  | **[NEW]** Hiển thị danh sách xung đột + severity badges                                 |
| `features/flight-plans/components/PlanStatusBadge.jsx` | **[NEW]** Badge hiển thị status với màu sắc                                             |

Route: `/operator/flight-plans`, `/operator/flight-plans/:id`

**Flight Plan Lifecycle UI**:

```
[Create DRAFT] → [Edit waypoints on map] → [Submit]
                                              ↓
                                   ┌─── No conflict → ✅ APPROVED (green badge)
                                   └─── Conflict    → ❌ REJECTED (red badge)
                                                        → [View conflicts]
                                                        → [Edit & Resubmit]
                                                        → [Cancel]
```

### 3.2 Conflicts Module (Admin only)

| File                                              | Nội dung                                                                                 |
| :------------------------------------------------ | :--------------------------------------------------------------------------------------- |
| `features/conflicts/services/conflictApi.js`      | **[NEW]** `fetchConflicts()`, `getConflictDetail(id)`, `resolveConflict(id, resolution)` |
| `features/conflicts/slices/conflictSlice.js`      | **[NEW]** Redux slice                                                                    |
| `features/conflicts/pages/ConflictListPage.jsx`   | **[NEW]** Danh sách conflicts (filter by status, method)                                 |
| `features/conflicts/pages/ConflictDetailPage.jsx` | **[NEW]** Chi tiết + resolve form                                                        |

Route: `/admin/conflicts`, `/admin/conflicts/:id`

---

## Phase 4: Flight Sessions & Realtime

> Prerequisites: Phase 3 hoàn thành (cần approved flight plan để start session)

### 4.1 Flight Session Module

| File                                                          | Nội dung                                                                             |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| `features/flight-sessions/services/flightSessionApi.js`       | **[NEW]** start, free-flight, end, abort, emergency, list, detail, telemetry, alerts |
| `features/flight-sessions/slices/flightSessionSlice.js`       | **[NEW]** Redux slice                                                                |
| `features/flight-sessions/pages/FlightSessionListPage.jsx`    | **[NEW]** Danh sách sessions (filter by status, sessionType)                         |
| `features/flight-sessions/pages/FlightSessionDetailPage.jsx`  | **[NEW]** Chi tiết session + live map + telemetry chart + alerts                     |
| `features/flight-sessions/components/StartSessionModal.jsx`   | **[NEW]** Chọn approved plan → start                                                 |
| `features/flight-sessions/components/SessionControlPanel.jsx` | **[NEW]** Buttons: End / Abort / Emergency                                           |
| `features/flight-sessions/components/TelemetryChart.jsx`      | **[NEW]** Chart hiển thị altitude, speed, battery theo thời gian                     |

Route: `/operator/flight-sessions`, `/operator/flight-sessions/:id`

### 4.2 Socket.IO Integration

```bash
npm install socket.io-client
```

| File                        | Nội dung                                                                             |
| :-------------------------- | :----------------------------------------------------------------------------------- |
| `shared/services/socket.js` | **[NEW]** Socket.IO singleton (connect, disconnect, event helpers)                   |
| `shared/hooks/useSocket.js` | **[NEW]** React hook quản lý socket lifecycle (connect on mount, cleanup on unmount) |

**Events**:

- `emit('telemetry', { sessionId, data })` → gửi vị trí drone
- `emit('watch_session', { sessionId })` → subscribe theo dõi session
- `on('telemetry_ack', callback)` → xác nhận đã lưu
- `on('alert', callback)` → nhận cảnh báo realtime
- `on('error', callback)` → xử lý lỗi

### 4.3 Alerts Module

| File                                       | Nội dung                                                                |
| :----------------------------------------- | :---------------------------------------------------------------------- |
| `features/alerts/services/alertApi.js`     | **[NEW]** `fetchAlerts()`, `getAlertDetail(id)`, `acknowledgeAlert(id)` |
| `features/alerts/slices/alertSlice.js`     | **[NEW]** Redux slice                                                   |
| `features/alerts/components/AlertBell.jsx` | **[NEW]** Notification bell icon trong Header (badge count)             |
| `features/alerts/components/AlertList.jsx` | **[NEW]** Dropdown/drawer danh sách alerts                              |

Alert types: `CONFLICT`, `ZONE_VIOLATION`, `DEVIATION`, `BATTERY_LOW`, `CONNECTION_LOST`

---

## Phase 5: Polish & Navigation

### 5.1 Admin Dashboard (`AdminDashboard.jsx`)

- Thống kê: tổng users, tổng zones, active conflicts, active sessions
- Quick links tới các trang quản lý
- Danh sách conflicts mới nhất

### 5.2 Operator Dashboard (`OperatorDashboard.jsx`)

- Danh sách drones (status overview)
- Flight plans gần đây (status badges)
- Active sessions (nếu có)
- Quick action: tạo flight plan mới

### 5.3 Navigation updates

- **AdminLayout sidebar**: Dashboard, Users, Zones, Conflicts, Profile
- **OperatorLayout sidebar**: Dashboard, Drones, Flight Plans, Flight Sessions, Zones (read-only), Profile
- Breadcrumbs trên mỗi page
- Active menu highlight theo route

### 5.4 Global enhancements

- 404 Not Found page
- Unauthorized page (khi truy cập route sai role)
- Loading skeleton components
- Toast notifications thống nhất

---

## Routing Summary

| Route                           | Component               | Role           | Phase |
| :------------------------------ | :---------------------- | :------------- | :---- |
| `/login`                        | LoginPage               | Public         | 0     |
| `/register`                     | RegisterPage            | Public         | 0     |
| `/admin/dashboard`              | AdminDashboard          | UTM_ADMIN      | 0     |
| `/admin/users`                  | UserPage                | UTM_ADMIN      | 0     |
| `/admin/zones`                  | ZonePage (CRUD)         | UTM_ADMIN      | 0     |
| `/admin/profile`                | ProfilePage             | UTM_ADMIN      | 1     |
| `/admin/conflicts`              | ConflictListPage        | UTM_ADMIN      | 3     |
| `/admin/conflicts/:id`          | ConflictDetailPage      | UTM_ADMIN      | 3     |
| `/operator/dashboard`           | OperatorDashboard       | FLEET_OPERATOR | 0     |
| `/operator/zones`               | ZonePage (read-only)    | FLEET_OPERATOR | 0     |
| `/operator/profile`             | ProfilePage             | FLEET_OPERATOR | 1     |
| `/operator/drones`              | DronePage               | FLEET_OPERATOR | 2     |
| `/operator/flight-plans`        | FlightPlanListPage      | FLEET_OPERATOR | 3     |
| `/operator/flight-plans/:id`    | FlightPlanDetailPage    | FLEET_OPERATOR | 3     |
| `/operator/flight-sessions`     | FlightSessionListPage   | FLEET_OPERATOR | 4     |
| `/operator/flight-sessions/:id` | FlightSessionDetailPage | FLEET_OPERATOR | 4     |

---

## Verification Checklist

### Phase 0 ✅

- [x] `npm run build` thành công (exit code 0, 36 files)
- [x] Redux DevTools hiển thị state đúng (đã test runtime)
- [x] Login → Redux state cập nhật (user + token) (đã test runtime)
- [x] Admin routes chỉ accessible cho UTM_ADMIN (đã test runtime)
- [x] Operator routes chỉ accessible cho FLEET_OPERATOR (đã test runtime)
- [x] CRUD Users hoạt động bình thường sau refactor (đã test runtime)
- [x] Zone management (map + form + list) hoạt động (đã test runtime)
- [x] CSS Modules cho new components — layouts, dashboards, zones
- [x] Auto redirect về /login khi token hết hạn (401) — in axios interceptor

### Phase 1–5

- [ ] Mỗi phase: API calls thành công (DevTools Network tab)
- [ ] Error handling hiển thị message hợp lý
- [ ] Responsive layout trên desktop
- [ ] Socket.IO connect/disconnect (Phase 4)
- [ ] Realtime alerts hiển thị đúng (Phase 4)
