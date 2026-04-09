POST
/api/simulations/missions/{id}/start
Khởi chạy fleet mission simulator cho một mission


Start simulator process ở backend để FE không cần chạy lệnh tay. Backend sẽ tự spawn script simulate-mission.js với JWT của request hiện tại.

Parameters
Try it out
Name	Description
id *
string
(path)
MongoDB ObjectId của mission cần mô phỏng

Example : 67f3b5f91c2b6c2d5fb92410

67f3b5f91c2b6c2d5fb92410
Request body

application/json
Example Value
Schema
{
  "mode": "normal",
  "timeScale": 10,
  "tickMs": 1000,
  "skipSafetyCheck": false
}
Responses
Code	Description	Links
202	
Simulation được tạo thành công

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "Simulation started",
  "run": {
    "runId": "1d86a0ea-d4ba-4ca8-8d14-f5a33da5b98f",
    "missionId": "67f3b5f91c2b6c2d5fb92410",
    "userId": "67f3b44e1c2b6c2d5fb923aa",
    "status": "RUNNING",
    "startedAt": "2026-04-08T03:12:39.793Z",
    "endedAt": "2026-04-08T03:12:39.793Z",
    "exitCode": null,
    "signal": null,
    "pid": 14820,
    "command": "node scripts/simulate-mission.js --missionId=67f3b5f91c2b6c2d5fb92410 --token=*** --mode=normal --timeScale=10 --tickMs=1000",
    "options": {
      "mode": "normal",
      "timeScale": 10,
      "tickMs": 1000,
      "deviationDroneIndex": 0,
      "skipSafetyCheck": false,
      "baseUrl": "http://localhost:5000",
      "wsUrl": "http://localhost:5000"
    },
    "logs": [
      {
        "ts": "2026-04-08T03:12:39.793Z",
        "stream": "stdout",
        "message": "🚀  Launching 3 drone(s)..."
      }
    ]
  }
}
No links
401	
Thiếu hoặc sai Bearer token

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links
403	
Không đủ quyền để chạy simulator

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links
409	
Mission này đã có một simulation đang chạy cho user hiện tại

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links
500	
Lỗi server khi khởi tạo process simulator

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links

POST
/api/simulations/{runId}/stop
Dừng simulation đang chạy


Parameters
Try it out
Name	Description
runId *
string
(path)
UUID của simulation run

Example : 1d86a0ea-d4ba-4ca8-8d14-f5a33da5b98f

1d86a0ea-d4ba-4ca8-8d14-f5a33da5b98f
Responses
Code	Description	Links
200	
Yêu cầu dừng simulation đã được ghi nhận

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "message": "Stopping simulation",
  "run": {
    "runId": "1d86a0ea-d4ba-4ca8-8d14-f5a33da5b98f",
    "missionId": "67f3b5f91c2b6c2d5fb92410",
    "userId": "67f3b44e1c2b6c2d5fb923aa",
    "status": "RUNNING",
    "startedAt": "2026-04-08T03:12:39.796Z",
    "endedAt": "2026-04-08T03:12:39.796Z",
    "exitCode": null,
    "signal": null,
    "pid": 14820,
    "command": "node scripts/simulate-mission.js --missionId=67f3b5f91c2b6c2d5fb92410 --token=*** --mode=normal --timeScale=10 --tickMs=1000",
    "options": {
      "mode": "normal",
      "timeScale": 10,
      "tickMs": 1000,
      "deviationDroneIndex": 0,
      "skipSafetyCheck": false,
      "baseUrl": "http://localhost:5000",
      "wsUrl": "http://localhost:5000"
    },
    "logs": [
      {
        "ts": "2026-04-08T03:12:39.796Z",
        "stream": "stdout",
        "message": "🚀  Launching 3 drone(s)..."
      }
    ]
  }
}
No links
403	
Không có quyền dừng run này

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links
404	
Không tìm thấy simulation run

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links

GET
/api/simulations/{runId}/status
Lấy trạng thái và log của simulation run


Parameters
Try it out
Name	Description
runId *
string
(path)
UUID của simulation run

Example : 1d86a0ea-d4ba-4ca8-8d14-f5a33da5b98f

1d86a0ea-d4ba-4ca8-8d14-f5a33da5b98f
Responses
Code	Description	Links
200	
Trạng thái hiện tại của simulation run

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "run": {
    "runId": "1d86a0ea-d4ba-4ca8-8d14-f5a33da5b98f",
    "missionId": "67f3b5f91c2b6c2d5fb92410",
    "userId": "67f3b44e1c2b6c2d5fb923aa",
    "status": "RUNNING",
    "startedAt": "2026-04-08T03:12:39.799Z",
    "endedAt": "2026-04-08T03:12:39.799Z",
    "exitCode": null,
    "signal": null,
    "pid": 14820,
    "command": "node scripts/simulate-mission.js --missionId=67f3b5f91c2b6c2d5fb92410 --token=*** --mode=normal --timeScale=10 --tickMs=1000",
    "options": {
      "mode": "normal",
      "timeScale": 10,
      "tickMs": 1000,
      "deviationDroneIndex": 0,
      "skipSafetyCheck": false,
      "baseUrl": "http://localhost:5000",
      "wsUrl": "http://localhost:5000"
    },
    "logs": [
      {
        "ts": "2026-04-08T03:12:39.799Z",
        "stream": "stdout",
        "message": "🚀  Launching 3 drone(s)..."
      }
    ]
  }
}
No links
403	
Không có quyền xem run này

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}
No links
404	
Không tìm thấy simulation run

Media type

application/json
Example Value
Schema
{
  "message": "Error message description"
}