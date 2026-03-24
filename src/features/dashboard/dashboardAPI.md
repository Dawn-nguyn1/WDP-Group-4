# GET /api/sepay/admin/payments
Lấy danh sách tất cả lịch sử thanh toán (Chỉ Admin)


Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:5000/api/sepay/admin/payments' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTgzZmMzOTgxNDUyMjg4ZTFiOGMzYjIiLCJyb2xlIjoiVVRNX0FETUlOIiwiaWF0IjoxNzc0MzQwMzAxLCJleHAiOjE3NzQ5NDUxMDF9.DT0Mkl2s0nkvGZd58ZQZHFVQ8SiUrsRRW3MJBW5HvvE'
Request URL
http://localhost:5000/api/sepay/admin/payments
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "code": 200,
  "data": [
    {
      "_id": "69c0bad2f80850f22f912a30",
      "order_id": "DH1774238418",
      "order_description": "Gói dành cho đối tác vận hành nhiều thiết bị",
      "order_amount": 2000,
      "customer_id": "69c0b98606a93e6169204953",
      "package_id": "69bfb75e77852f25b566f1fe",
      "status": "PENDING",
      "createdAt": "2026-03-23T04:00:18.722Z",
      "updatedAt": "2026-03-23T04:00:18.722Z",
      "__v": 0
    }
  ]
}

# GET /api/sepay/admin/revenue
Thống kê doanh thu theo ngày, tháng, năm (Chỉ Admin)


Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:5000/api/sepay/admin/revenue' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTgzZmMzOTgxNDUyMjg4ZTFiOGMzYjIiLCJyb2xlIjoiVVRNX0FETUlOIiwiaWF0IjoxNzc0MzQwMzAxLCJleHAiOjE3NzQ5NDUxMDF9.DT0Mkl2s0nkvGZd58ZQZHFVQ8SiUrsRRW3MJBW5HvvE'
Request URL
http://localhost:5000/api/sepay/admin/revenue
Server response
Code	Details
200	
Response body
Download
{
  "success": true,
  "code": 200,
  "data": {
    "daily": [
      {
        "_id": {
          "year": 2026,
          "month": 3,
          "day": 23
        },
        "totalRevenue": 4000,
        "transactionCount": 2
      },
      {
        "_id": {
          "year": 2026,
          "month": 3,
          "day": 22
        },
        "totalRevenue": 54000,
        "transactionCount": 3
      }
    ],
    "monthly": [
      {
        "_id": {
          "year": 2026,
          "month": 3
        },
        "totalRevenue": 58000,
        "transactionCount": 5
      }
    ],
    "yearly": [
      {
        "_id": {
          "year": 2026
        },
        "totalRevenue": 58000,
        "transactionCount": 5
      }
    ]
  }
}
Response headers
 access-control-allow-credentials: true 
 access-control-allow-origin: http://localhost:5713 
 content-length: 372 
 content-type: application/json; charset=utf-8 
 date: Tue,24 Mar 2026 08:31:14 GMT 
 etag: W/"174-aviODZ5V4q8HjzIVNsGcOGe4ZUs" 
 vary: Origin 
 x-powered-by: Express 
Responses
Code	Description	Links
200	
Lấy thống kê doanh thu thành công

Media type

application/json
Controls Accept header.
Example Value
Schema
{
  "success": true,
  "code": 200,
  "data": {
    "daily": [
      {}
    ],
    "monthly": [
      {}
    ],
    "yearly": [
      {}
    ]
  }
}
No links
401	
Không được xác thực

No links
403	
Không có quyền truy cập

No links
500	
Lỗi server

No links
