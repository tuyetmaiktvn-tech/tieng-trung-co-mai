# Rà soát câu hỏi và âm thanh HSK2 — 2026-09-09

## Cập nhật sau khi nhận PDF gốc

Đã sửa `hsk2-test2.html` theo PDF `Đề HSK 2 số 2.pdf` (H20902, 18 trang): dùng 12 trang câu hỏi và bảng đáp án ở trang PDF 18. Ảnh mới nằm trong `assets/images/hsk2-test2-h20902/`; 10 ảnh cũ H21003 không còn được trang nào sử dụng đã được bỏ. PDF `Đề HSK 2 số 3.pdf` xác nhận H21003 đúng là đề 3.

Hai MP3 trên Desktop trùng hoàn toàn với MP3 đề 1 và đề 2 trong dự án. Giữ MP3 đề 2 H20902, thêm phiên bản vào URL để tải lại. Không hoán đổi audio đề 2–3.

Đề 2 hiện có 60 câu với điều khiển tại từng câu, đủ ví dụ, 94 vùng SVG có clipPath riêng. Đã xem các vùng cắt được trích xuất cùng mặt nạ che ký hiệu; kiểm tra đủ tài nguyên, ID duy nhất, đáp án hợp lệ. Chạy logic JavaScript trong DOM mô phỏng: bỏ trống 0/60, toàn bộ đúng 60/60, đổi một đáp án 59/60, cập nhật tiến độ, làm lại xóa chọn và đặt audio/đồng hồ về đầu đều đạt. Đây không phải kiểm thử trình duyệt. Không có trình duyệt kết nối để kiểm tra trực tiếp desktop/mobile hoặc phát âm thanh. Chưa push/deploy.

Các phần bên dưới lưu kết quả trước khi sửa để truy nguyên. Dòng đề 2 và nhận xét thiếu ví dụ của đề 2 bên dưới đã được xử lý trong bản cục bộ mới.

Phạm vi: tệp trong dự án, gồm 11 đề đánh số (1–6, 8–12) và bài test đầu ra. Không có đề số 7 trong dự án hoặc liên kết HSK2 đến đề số 7 ở trang danh mục.

## Kết quả đối chiếu

| Đề | Mã trên ảnh nguồn | Mã đọc được trong MP3 | Kết luận về mã |
| --- | --- | --- | --- |
| 1 | H20901 | H20901 | Khớp mã |
| 2 | H21003 | H20902 | **Lệch mã; ảnh và đáp án trùng bộ đề 3** |
| 3 | H21003 | H21003 | Khớp mã |
| 4 | H21004 | H21004 | Khớp mã |
| 5 | H21005 | H21005 | Khớp mã |
| 6 | H21006 | Không tìm được | Chưa xác minh nội dung MP3 |
| 8 | H21330 | Không tìm được | Chưa xác minh nội dung MP3 |
| 9 | H21331 | Không tìm được | Chưa xác minh nội dung MP3 |
| 10 | H21332 | Không tìm được | Chưa xác minh nội dung MP3 |
| 11 | H21335 | Không tìm được | Chưa xác minh nội dung MP3 |
| 12 | H21334 | Không tìm được | Chưa xác minh nội dung MP3 |
| Đầu ra | Không thấy mã trên trang ảnh đầu | Không tìm được | Chưa xác minh nội dung MP3 |

“Khớp mã” chỉ là đối chiếu nhãn trên ảnh với metadata, không thay thế việc nghe từng câu. Không tìm được mã không có nghĩa file sai.

## Bằng chứng ở đề 2

- Cả 10 ảnh PNG trong `assets/images/hsk2-test2/` ghi H21003. Cả 12 ảnh của đề 3 cũng thuộc H21003. Đã dùng OCR toàn bộ 128 ảnh nguồn của các đề đánh số và xem trực tiếp trang đầu từng đề. OCR có trường hợp nhận chữ H thành `11` hoặc `1-1`; đã đối chiếu mã với ảnh trang đầu.
- Ảnh đầu đề 2 và đề 3 cùng thứ tự: lịch, người chơi tennis, người đàn ông, người nằm bệnh, người phụ nữ trước máy tính.
- Toàn bộ 60 đáp án trong `test-config` của đề 2 và đề 3 giống nhau. Đây là bằng chứng bổ sung cho việc bộ câu hỏi đề 2 bị trùng bộ đề 3; chưa kiểm chứng từng đáp án với tài liệu đáp án gốc độc lập.
- MP3 đề 2 ghi H20902. SHA-256: `2D09ABBE8EFA245E5B29E51583191A432A473D6046707F81121DB5357FBDC436`. File này trùng hoàn toàn với file `Đề HSK 2 số 2 file nghe.mp3` trên Desktop.
- MP3 đề 3 ghi H21003. SHA-256: `14DC54FF7F6337DB53057FFA8CF1D471337D0E397549C838191FA0DB1D59D36A`.

Hướng xử lý phù hợp: lấy lại câu hỏi và đáp án gốc H20902 để tích hợp vào đề 2, giữ bộ H21003 ở đề 3. Đổi chỗ hai MP3 sẽ làm đề 3 lệch mã. Chưa thay audio hoặc câu hỏi trong lần rà soát này.

## Kiểm tra tệp và cấu trúc

- Có đủ 12 MP3 được các trang HSK2 liên kết; không có MP3 trùng hoàn toàn theo SHA-256.
- Không phát hiện tài nguyên cục bộ được liên kết bị thiếu trong 12 trang; không phát hiện ID HTML bị trùng.
- Mỗi đề đánh số có đủ 60 nhóm trả lời và 60 đáp án cấu hình. Các đáp án cấu hình đều nằm trong lựa chọn của câu tương ứng.
- Bài đầu ra có đủ điều khiển câu 1–60: 55 câu chọn và 5 câu nhập chữ.
- 128 ảnh nguồn các đề đánh số không cho thấy mã đề khác xen vào trong cùng thư mục. Riêng đề 2 dùng cùng mã nguồn với đề 3.
- Đề 1 và đề 2 không hiển thị hai hình ví dụ đầu phần nghe dù ảnh nguồn có chúng; điều này có thể gây khó theo dõi đoạn hướng dẫn. Không coi đây là bằng chứng MP3 sai.
- File chuẩn đề 1 người dùng gửi trùng MP3 trong dự án, SHA-256 `E6D84AA99F1B3F1B834004CB55BD4803CA6CCADFC59415277F70D6307557D1E1`.

## Giới hạn và phần còn cần kiểm tra

Chưa nghe hoặc phiên âm trực tiếp toàn bộ MP3, chưa xác nhận nội dung lời nghe theo từng câu, chưa kiểm tra trực tiếp thao tác làm bài trên trình duyệt hay bản đã triển khai trên website. Chưa xác minh độ đầy đủ của từng vùng cắt ảnh và độ chính xác của toàn bộ đáp án gốc. Các kiểm tra cấu trúc ở trên không thay thế những bước này.

Đề 6, 8–12 và bài đầu ra cần audio nguồn có mã xác định hoặc đối chiếu lời nghe với đề để kết luận. Không đánh dấu các đề này là đã khớp âm thanh chỉ dựa vào tên tệp.
