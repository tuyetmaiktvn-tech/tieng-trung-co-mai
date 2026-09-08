# Quy tắc trình bày đề kiểm tra

Áp dụng cho mọi đề kiểm tra được thêm hoặc cập nhật trong dự án, ở tất cả cấp độ HSK. Đây là yêu cầu của chủ dự án.

- Đặt nút chọn đáp án hoặc ô nhập ngay tại từng câu nghe, đọc, viết. Không gom ô trả lời thành bảng riêng ở cuối phần khiến người học phải cuộn qua đề để trả lời.
- Với câu chọn hình, căn các nút A/B/C (hoặc các lựa chọn tương ứng) theo đúng cột hình, ngay dưới hàng hình của câu đó.
- Khi đã có nút chọn hoặc ô nhập, ẩn ký hiệu trả lời in sẵn bị trùng trên ảnh (chẳng hạn chữ A/B/C dưới hàng hình hoặc ô vuông khoanh đáp án). Chỉ che đúng ký hiệu dư, không che hình, nội dung lựa chọn, chữ Hán hay pinyin. Giữ nhãn trong danh sách đáp án dùng chung để người làm đối chiếu và giữ ví dụ hướng dẫn.
- Với câu đọc, đặt lựa chọn ngay dưới nội dung câu. Với câu điền hoặc viết, đặt ô nhập ngay cạnh hoặc dưới câu tương ứng.
- Với nhóm dùng chung hình hoặc danh sách lựa chọn, giữ phần tham chiếu chung gần các câu; mỗi câu vẫn có bộ điều khiển trả lời riêng. Bố cục phải dùng được trên điện thoại và máy tính.
- Khi đề nguồn là ảnh, xác định ranh giới từng câu theo ảnh thực tế; không sao chép tọa độ cắt từ đề khác. Không cắt mất chữ Hán, pinyin, hình, hoặc lựa chọn của câu kế tiếp.
- Nếu hiển thị vùng ảnh bằng SVG `viewBox`, thêm `clipPath` trùng đúng vùng cắt và ID riêng cho từng vùng. Chỉ dùng `viewBox` không đủ ngăn phần ảnh bên ngoài xuất hiện khi khung thay đổi tỷ lệ. Cột đáp án chung phải loại hết chữ và ô trả lời của cột câu hỏi bên cạnh.
- Dùng `hsk/hsk1-final-test.html`, `hsk/hsk2-final-test.html` và `assets/css/test-inline-answers.css` làm mẫu bố cục. Tái sử dụng CSS chung khi phù hợp.
- Giữ đúng số câu, lựa chọn, đáp án chấm điểm, tiến độ, âm thanh, đồng hồ và chức năng làm lại. Mỗi câu chỉ có một bộ điều khiển trả lời và một ID kết quả duy nhất.
- Trước khi hoàn tất, kiểm tra đủ nội dung từng câu, liên kết tài nguyên, chọn/đổi đáp án, chấm điểm và làm lại; kiểm tra bố cục trên màn hình lớn và nhỏ khi có trình duyệt khả dụng. Nêu rõ nếu chưa kiểm tra trực tiếp được.

Đây là quy tắc khi biên soạn và tích hợp đề mới; thao tác Git Push tự nó không chuyển đổi bố cục của tệp đề được tải lên.

## Đánh số đề HSK 1

- Bộ H10901 là Đề 1 HSK1 (`hsk/hsk1-test1.html`). Các đề HSK1 thêm tiếp theo được đánh số Đề 2, Đề 3… theo thứ tự tích hợp; kiểm tra số đã có trước khi tạo đề mới. Giữ bài test đầu ra riêng, không tính vào chuỗi số đề.
