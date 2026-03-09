tôi muốn có 1 trang để chọn tọa độ A và B nhằm vẽ đường bay cho flycam trên map, sau khi chọn xong sẽ hiển thị đường thằng trên 2 điểm đó và tôi có thể thêm tọa độ giữa đường thẳng đó để điều khiển hướng bay của flycam như chế độ Corridor trong dronedeploy.com.
Nói tôi biết tôi cần làm những gì, tôi đã có những gì trong project này?
----

bước 2: 
ở trang flight planning, nếu tôi ấn nút "tạo đường bay mới" nó sẽ cho tôi chọn 2 điểm A B để vẽ đường bay, trong khi đó tôi sẽ không thể ấn các nút ở bảng điều khiển -> tôi muốn có thêm nút dừng vẽ nếu tôi lỡ ấn nút "tạo đường bay mới"

bước 3:
tôi muốn trang flight của tôi hoạt động như sau:

sau khi ấn "tạo đường bay mới" thì hệ thống cho phép tôi chấm 2 điểm, theo thứ tự điểm mà tôi chấm trên màn hình mà ghi lại các thông tin waypoints này:
+sequenceNumber: đánh thứ tự từ 1 
+latitude: tự động lấy
+longitude: tự động lấy
+speed: mặc định cho 10m/s
+estimatedTime: tự động tính
+action: TAKEOFF nếu là điểm đầu tiên tôi chọn và LAND nếu là điểm thứ 2 tôi chọn
-> sau khi chọn xong, tôi có thể nhấn "lưu plan "để bắt đầu tạo chuyến bay với modal hiện lên để điền các thông tin còn lại là:
+drone: id của drone muốn lập chuyến bay
+plannedStart: giờ bắt đầu bay
+plannedEnd: giờ đến
+priority: độ ưu tiên chuyến bay so với các chuyến khác
+waypoints: được ghi tự động