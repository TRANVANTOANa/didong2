# 🚀 KÍCH HOẠT CHẾ ĐỘ FULL AI

Hiện tại ứng dụng đang chạy ở chế độ **Fallback** (cơ bản). Để AI thông minh hơn và lưu được lịch sử chat, bạn cần làm 2 bước sau:

## 1. Lấy Gemini API Key (Miễn phí)
1. Truy cập: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Đăng nhập Google Account.
3. Nhấn **"Create API Key"**.
4. Copy key vừa tạo (dạng `AIza...`).

## 2. Điền Key vào Code
Mở file `lib/gemini.ts` và thay thế dòng 8:

```typescript
// d:\TranVanToan_dt2\MyApp\lib\gemini.ts

// TÌM DÒNG NÀY:
const API_KEY = "AIzaSyAFhUCO5aBaLCLXQBXGwi7xS3m0yMJFrNk"; 

// THAY BẰNG KEY CỦA BẠN:
const API_KEY = "Paste_Key_Của_Bạn_Vào_Đây";
```

## 3. Fix Lỗi Firebase (Lưu Lịch Sử)
1. Truy cập [Firebase Console](https://console.firebase.google.com/) -> Chọn project `giay-762b5`.
2. Vào **Firestore Database** -> Tab **Rules**.
3. Copy nội dung file `firestore.rules` (trong thư mục gốc dự án) và paste vào đó -> Nhấn **Publish**.
4. Vào Tab **Indexes** (nếu thấy lỗi trong console có link dài, click vào link đó để tạo index tự động).

---

## ✅ KẾT QUẢ
Sau khi làm xong, app sẽ:
- 🧠 Hiểu được: "Tìm giày màu đỏ đi chơi tết", "Giày nào rẻ nhất?"
- 💾 Lưu lại lịch sử chat kể cả khi tắt app.
- 🗣️ Trả lời tự nhiên, thân thiện hơn.

**Test ngay:**
"Chào bạn, mình muốn tìm giày Nike màu xanh đi học"
-> AI sẽ trả lời và hiện đúng giày Nike xanh!
