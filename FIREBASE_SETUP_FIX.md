# 🔥 Firebase Setup cho AI Chat - Hướng Dẫn Chi Tiết

## ⚠️ CÁC LỖI CẦN FIX

Bạn đang gặp 3 lỗi Firebase:

### 1. ❌ Lỗi: "Missing or insufficient permissions"
**Nguyên nhân:** Firestore Rules chưa cho phép read/write collection `chatHistory`

### 2. ❌ Lỗi: "The query requires an index"
**Nguyên nhân:** Query cần index cho `userId` và `timestamp`

### 3. ❌ Lỗi: "API key not valid"
**Nguyên nhân:** Gemini API key chưa đúng hoặc hết hạn

---

## 🛠️ CÁCH SỬA (Làm Theo Thứ Tự)

### ✅ Bước 1: Fix Firestore Rules

1. Vào **Firebase Console**: https://console.firebase.google.com/
2. Chọn project: **giay-762b5**
3. Click **Firestore Database** (menu bên trái)
4. Click tab **Rules**
5. Copy & paste rules sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rules cho products (cho phép đọc public)
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Chỉ admin mới được write
    }
    
    // Rules cho chatHistory (cho phép read/write với userId)
    match /chatHistory/{messageId} {
      allow read: if true;  // Tạm thời cho phép đọc tất cả (nên restrict theo userId sau)
      allow write: if true; // Tạm thời cho phép write tất cả
      
      // Rules tốt hơn (nếu có auth):
      // allow read, write: if request.auth != null && 
      //   request.auth.uid == resource.data.userId;
    }
    
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Click **Publish** để save

---

### ✅ Bước 2: Tạo Firestore Index

**Cách 1: Click Link Tự Động (Dễ nhất)**

Trong console log lỗi, bạn thấy link:
```
https://console.firebase.google.com/v1/r/project/giay-762b5/firestore/index...
```

👉 **Click vào link đó** → Firebase tự động tạo index → Click **Create Index**

---

**Cách 2: Tạo Thủ Công**

1. Vào Firebase Console → **Firestore Database**
2. Click tab **Indexes**
3. Click **Create Index**
4. Điền thông tin:
   - **Collection ID:** `chatHistory`
   - **Fields:**
     - Field 1: `userId` - **Ascending**
     - Field 2: `timestamp` - **Ascending**
   - **Query scope:** Collection
5. Click **Create**
6. Đợi 2-3 phút để index được build

---

### ✅ Bước 3: Lấy Gemini API Key Mới

API key hiện tại không hợp lệ. Lấy key mới:

1. Truy cập: **https://makersuite.google.com/app/apikey**
2. Đăng nhập Google Account
3. Click **"Create API Key"** (hoặc "Get API Key")
4. Copy API key

5. Mở file: **`lib/gemini.ts`** (dòng 8)
6. Thay thế:
   ```typescript
   const API_KEY = "AIzaSyAFhUCO5aBaLCLXQBXGwi7xS3m0yMJFrNk";
   ```
   Thành:
   ```typescript
   const API_KEY = "YOUR_NEW_API_KEY_HERE"; // Paste API key mới
   ```

7. Save file

---

## 📝 Kiểm Tra Kết Quả

### Test Firebase Rules:
1. Chạy lại app: `npx expo start`
2. Mở AI Chat
3. Gửi 1 tin nhắn bất kỳ
4. Check console → Không còn lỗi "Missing permissions" ✅

### Test Firebase Index:
1. Gửi tin nhắn
2. Đóng app, mở lại
3. Lịch sử chat sẽ được load lại ✅
4. Không còn lỗi "query requires an index" ✅

### Test Gemini API:
1. Hỏi AI: "Có giày Nike màu xanh không?"
2. AI sẽ trả lời (không còn lỗi "API key not valid") ✅

---

## 🚨 Lưu Ý Quan Trọng

### 1. Firestore Rules (Bảo Mật)
Rules hiện tại cho phép read/write tất cả để test. **Sau này nên tighten security:**

```javascript
match /chatHistory/{messageId} {
  allow read: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  allow write: if request.auth != null;
}
```

### 2. API Key (Bảo Mật)
- ❌ KHÔNG commit API key lên Git
- ✅ NÊN dùng environment variables (.env file)

Cách tốt hơn:
1. Tạo file `.env`:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
2. Trong `lib/gemini.ts`:
   ```typescript
   const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
   ```
3. Add `.env` vào `.gitignore`

### 3. Quotas & Billing
- Gemini API Free tier: 60 requests/minute
- Nếu vượt quota → lỗi "429 Too Many Requests"
- Check quota: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

---

## 🐛 Troubleshooting

### Vẫn bị lỗi "Missing permissions"?
- Đợi 1-2 phút sau khi publish rules
- Hard refresh browser (Ctrl+Shift+R)
- Check lại rules đã publish chưa

### Index build quá lâu?
- Thường mất 2-5 phút
- Nếu quá 10 phút → Delete và tạo lại
- Check tab "Indexes" xem status

### API key vẫn invalid?
- Kiểm tra đã copy đúng key không (không có space thừa)
- Enable API tại: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- Thử tạo key mới

### Lịch sử chat không load?
- Check index đã build xong chưa
- Check Firestore console xem có data trong `chatHistory` không
- Xem console log để debug

---

## ✅ Checklist

Sau khi làm xong, check:

- [ ] Firestore Rules đã publish
- [ ] Firebase Index đã create (và status = "Enabled")
- [ ] Gemini API key đã update trong `lib/gemini.ts`
- [ ] Chạy lại app không có lỗi
- [ ] Gửi tin nhắn thành công
- [ ] AI trả lời được
- [ ] Đóng/mở lại app → Lịch sử vẫn còn

---

## 📞 Nếu Vẫn Gặp Vấn Đề

Copy error message từ console và check:
1. Firebase Console → Firestore → Usage tab (xem có requests fail không)
2. Cloud Console → API & Services → Credentials (check API key)
3. Console log trong app (check error details)

Made with ❤️ for debugging Firebase!
