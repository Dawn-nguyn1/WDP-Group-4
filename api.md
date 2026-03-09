# flight

GET
/api/flight-plans
Danh sách kế hoạch bay của user hiện tại


Lấy danh sách flight plans với pagination và filter theo status.

Parameters
Cancel
Name	Description
status
string
(query)
Filter theo trạng thái flight plan


--
page
integer
(query)
1
limit
integer
(query)
10
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:5000/api/flight-plans?page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTgzZmMzOTgxNDUyMjg4ZTFiOGMzYjIiLCJyb2xlIjoiVVRNX0FETUlOIiwiaWF0IjoxNzczMDIwNTk0LCJleHAiOjE3NzM2MjUzOTR9.5mz_gMz3lhROawBTpzULxoYVHuUH-nKUYZUAOtcc79Y'
Request URL
http://localhost:5000/api/flight-plans?page=1&limit=10
Server response
Code	Details
200	
Response body
Download
{
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalCount": 0,
    "limit": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: * 
 connection: keep-alive 
 content-length: 123 
 content-type: application/json; charset=utf-8 
 date: Mon,09 Mar 2026 01:54:16 GMT 
 etag: W/"7b-DUrb/6PPg+TI8ZPacZ6tZ3Mn9cY" 
 keep-alive: timeout=5 
 x-powered-by: Express 
Responses
Code	Description	Links
200	
Success

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "data": [
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
        "createdAt": "2026-03-09T02:02:05.660Z",
        "updatedAt": "2026-03-09T02:02:05.660Z"
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
        "createdAt": "2026-03-09T02:02:05.660Z",
        "updatedAt": "2026-03-09T02:02:05.660Z"
      },
      "status": "DRAFT",
      "plannedStart": "2026-03-09T02:02:05.660Z",
      "plannedEnd": "2026-03-09T02:02:05.660Z",
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
      "createdAt": "2026-03-09T02:02:05.660Z",
      "updatedAt": "2026-03-09T02:02:05.660Z"
    }
  ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 0,
    "totalCount": 0,
    "limit": 0,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
No links
401	
Unauthorized

No links
500	
Internal server error

-------------------
POST
/api/flight-plans
Tạo mới kế hoạch bay (DRAFT)


Tạo một flight plan mới ở trạng thái DRAFT với danh sách waypoints 4D. Hệ thống tự động tạo routeGeometry (GeoJSON LineString) từ waypoints. Yêu cầu ít nhất 2 waypoint (takeoff và land).

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "drone": "507f1f77bcf86cd799439011",
  "plannedStart": "2026-01-20T08:00:00Z",
  "plannedEnd": "2026-01-20T09:00:00Z",
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
    "createdAt": "2026-03-09T02:02:50.820Z",
    "updatedAt": "2026-03-09T02:02:50.820Z"
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
    "createdAt": "2026-03-09T02:02:50.820Z",
    "updatedAt": "2026-03-09T02:02:50.820Z"
  },
  "status": "DRAFT",
  "plannedStart": "2026-03-09T02:02:50.820Z",
  "plannedEnd": "2026-03-09T02:02:50.820Z",
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
  "createdAt": "2026-03-09T02:02:50.820Z",
  "updatedAt": "2026-03-09T02:02:50.820Z"
}
No links
400	
Validation error (missing fields, < 2 waypoints, plannedEnd <= plannedStart)

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

