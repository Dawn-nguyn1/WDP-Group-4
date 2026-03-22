#  ################  Flight Plans   ################ 
Quản lý route template bay (không chứa lịch thời gian)



# POST
/api/flight-plans
Tạo mới kế hoạch bay (DRAFT)


Tạo một flight plan dạng route template ở trạng thái DRAFT. Flight plan không còn chứa thời gian bay tổng thể. Lịch bay (plannedStart/plannedEnd) được quản lý ở MissionPlan. Hệ thống tự động tạo routeGeometry (GeoJSON LineString) từ waypoints. Validation chính:

waypoints từ 2 đến 500 điểm
sequenceNumber phải liên tục 1..N, không trùng
không cho phép segment quá dài
altitude waypoint không vượt maxAltitude của drone (nếu có)
Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "drone": "507f1f77bcf86cd799439011",
  "priority": 1,
  "waypoints": [
    {
      "sequenceNumber": 1,
      "latitude": 10.8231,
      "longitude": 106.6297,
      "altitude": 50,
      "speed": 0,
      "estimatedTime": "2026-01-20T08:00:00Z",
      "action": "TAKEOFF"
    },
    {
      "sequenceNumber": 2,
      "latitude": 10.83,
      "longitude": 106.64,
      "altitude": 100,
      "speed": 15,
      "estimatedTime": "2026-01-20T08:30:00Z",
      "action": "WAYPOINT"
    },
    {
      "sequenceNumber": 3,
      "latitude": 10.835,
      "longitude": 106.645,
      "altitude": 50,
      "speed": 10,
      "estimatedTime": "2026-01-20T09:00:00Z",
      "action": "LAND"
    }
  ],
  "notes": "Routine inspection flight plan"
}
Responses
Code	Description	Links
201	
Flight plan created successfully

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "string",
  "drone": {
    "_id": "507f1f77bcf86cd799439011",
    "droneId": "DRONE001",
    "serialNumber": "SN123456",
    "model": "DJI Air 3",
    "owner": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "profile": {
        "fullName": "John Doe"
      },
      "role": "INDIVIDUAL_OPERATOR"
    },
    "ownerType": "INDIVIDUAL",
    "maxAltitude": 5000,
    "status": "IDLE",
    "createdAt": "2026-03-17T13:33:37.983Z",
    "updatedAt": "2026-03-17T13:33:37.983Z"
  },
  "pilot": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "profile": {
      "fullName": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "role": "INDIVIDUAL_OPERATOR",
    "status": "active",
    "createdAt": "2026-03-17T13:33:37.983Z",
    "updatedAt": "2026-03-17T13:33:37.983Z"
  },
  "status": "DRAFT",
  "priority": 0,
  "waypoints": [
    {
      "sequenceNumber": 1,
      "latitude": 10.8231,
      "longitude": 106.6297,
      "altitude": 100,
      "speed": 10,
      "estimatedTime": "2026-01-20T08:00:00Z",
      "action": "WAYPOINT"
    }
  ],
  "routeGeometry": {
    "type": "LineString",
    "coordinates": [
      [
        0
      ]
    ]
  },
  "conflictStatus": "CLEAR",
  "notes": "string",
  "createdAt": "2026-03-17T13:33:37.983Z",
  "updatedAt": "2026-03-17T13:33:37.983Z"
}
No links
400	
Validation error (waypoint/geometry/drone status)

No links
401	
Unauthorized

No links
403	
Forbidden - không sở hữu drone

No links
404	
Drone not found

No links
500	
Internal server error

No links




# ################ Missions ################
Quản lý mission và lịch thực thi plan qua MissionPlan



#  POST
/api/missions
Tạo mission mới (chỉ FLEET_OPERATOR)


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "name": "Morning Fleet Run",
  "description": "Mission for urban delivery routes",
  "status": "DRAFT"
}
Responses
Code	Description	Links
201	
Mission created

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "string",
  "name": "Morning Fleet Run",
  "description": "Mission for urban delivery routes",
  "status": "DRAFT",
  "createdBy": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "profile": {
      "fullName": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "role": "INDIVIDUAL_OPERATOR",
    "status": "active",
    "createdAt": "2026-03-17T14:12:52.147Z",
    "updatedAt": "2026-03-17T14:12:52.147Z"
  },
  "createdAt": "2026-03-17T14:12:52.147Z",
  "updatedAt": "2026-03-17T14:12:52.147Z"
}
No links
400	
Validation error

No links
401	
Unauthorized

No links
403	
Forbidden

No links


#  GET
/api/missions
Danh sách mission của user hiện tại


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
Success

Media type

application/json
Controls Accept header.
Example Value
Schema
[
  {
    "_id": "string",
    "name": "Morning Fleet Run",
    "description": "Mission for urban delivery routes",
    "status": "DRAFT",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "profile": {
        "fullName": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "role": "INDIVIDUAL_OPERATOR",
      "status": "active",
      "createdAt": "2026-03-17T14:14:07.711Z",
      "updatedAt": "2026-03-17T14:14:07.711Z"
    },
    "createdAt": "2026-03-17T14:14:07.711Z",
    "updatedAt": "2026-03-17T14:14:07.711Z"
  }
]

# ############ ZONE ################

PUT
/api/zones/{id}
Cập nhật thông tin một zone


Cập nhật zone với các field được cung cấp. Chỉ cần gửi các field muốn thay đổi. Lưu ý:

Không thể edit zone đã bị archived
Không thể đổi status thành 'archived' qua endpoint này (sử dụng DELETE để archive)
Nếu thay đổi geometry, validation polygon (closed, không tự cắt) sẽ được thực hiện
Parameters
Try it out
Name	Description
id *
string
(path)
MongoDB ObjectId của zone cần cập nhật

Example : 507f1f77bcf86cd799439011

507f1f77bcf86cd799439011
Request body

application/json
Example Value
Schema
{
  "name": "Updated Airport Zone",
  "description": "Updated no-fly zone description",
  "maxAltitude": 5000,
  "status": "active"
}
Responses
Code	Description	Links
200	
Cập nhật thành công

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Tan Son Nhat Airport",
  "description": "No-fly zone around Tan Son Nhat International Airport",
  "type": "no_fly",
  "status": "active",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          106.6297,
          10.8231
        ],
        [
          106.6397,
          10.8231
        ],
        [
          106.6397,
          10.8331
        ],
        [
          106.6297,
          10.8331
        ],
        [
          106.6297,
          10.8231
        ]
      ]
    ]
  },
  "minAltitude": 0,
  "maxAltitude": 3000,
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": "2027-01-01T00:00:00Z",
  "createdBy": "507f1f77bcf86cd799439012",
  "createdAt": "2026-01-20T07:46:49.536Z",
  "updatedAt": "2026-01-20T07:46:49.536Z"
}
No links
400	
Dữ liệu không hợp lệ

Media type

application/json
Examples

invalidId
Example Value
Schema
{
  "message": "Invalid zone ID format"
}
No links
401	
Không được xác thực

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links
404	
Không tìm thấy zone

Media type

application/json
Example Value
Schema
{
  "message": "Zone not found"
}
No links
500	
Lỗi server

Media type

application/json
Example Value
Schema
{
  "message": "Failed to update zone"
}