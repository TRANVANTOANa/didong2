# AI Shopping Assistant - Hướng Dẫn Setup

## ✨ Các Tính Năng

### 1. **AI Chat Thông Minh**
- Hiểu ngôn ngữ tự nhiên tiếng Việt
- Phân tích yêu cầu người dùng (màu sắc, giá, thương hiệu, phong cách)
- Gợi ý sản phẩm phù hợp từ Firebase

### 2. **Click Vào Sản Phẩm → Product Detail**
- Mỗi sản phẩm trong chat có thể click
- Tự động navigate sang trang chi tiết sản phẩm

### 3. **Lưu Lịch Sử Chat vào Firebase**
- Tất cả tin nhắn được lưu vào Firestore
- Load lại lịch sử khi mở app

### 4. **UI Đẹp & Mượt**
- Chat bubble với avatar
- Typing indicator
- Smooth scroll animation
- Gợi ý câu hỏi mẫu

## 🔧 Setup

### Bước 1: Cài Đặt Package
Package `@google/generative-ai` đã được cài đặt. Nếu cần cài lại:

```bash
npm install @google/generative-ai
```

### Bước 2: Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng Google Account
3. Click **"Create API Key"**
4. Copy API key

### Bước 3: Cập Nhật API Key

Mở file: `lib/gemini.ts`

Thay thế dòng:
```typescript
const API_KEY = "YOUR_API_KEY_HERE";
```

Bằng API key thực của bạn:
```typescript
const API_KEY = "AIzaSy..."; // Paste API key ở đây
```

**Lưu ý**: Để bảo mật hơn, nên tạo file `.env` và lưu API key vào đó.

### Bước 4: Setup Firebase Firestore

Đảm bảo bạn đã enable Firestore trong Firebase Console:
1. Vào Firebase Console
2. Chọn **Firestore Database**
3. Click **Create Database** (nếu chưa có)
4. Chọn mode: **Start in production mode** hoặc **Test mode**

## 📱 Cách Sử Dụng

### 1. Mở AI Chat
- Nhấn vào tab **"AI Chat"** (icon chat bubbles) ở bottom tab bar

### 2. Hỏi AI
Ví dụ:
- "Có giày Nike màu xanh dưới 4 triệu không?"
- "Tìm giày chạy bộ Adidas giá tầm 3 triệu"
- "Giày streetwear màu đen"

### 3. Xem Sản Phẩm Gợi Ý
- AI sẽ trả lời và hiển thị danh sách sản phẩm phù hợp
- Click vào bất kỳ sản phẩm nào → Mở Product Detail

### 4. Xóa Lịch Sử
- Nhấn icon **Trash** ở góc trên bên phải

## 🎯 Cách Hoạt Động

### Flow:
1. **User gửi tin nhắn** → Lưu vào state + Firebase
2. **Gọi AI** (Gemini API) để phân tích intent:
   - Brand (Nike, Adidas, Puma...)
   - Color (đỏ, xanh, đen...)
   - Price range (dưới 4 triệu, từ 2-3 triệu...)
   - Style (streetwear, sport, casual...)
3. **Tìm kiếm sản phẩm** từ Firebase theo intent
4. **AI tạo câu trả lời** dựa trên sản phẩm tìm được
5. **Hiển thị** câu trả lời + danh sách sản phẩm

## 🚀 Nâng Cao

### Cải Thiện AI Prompt
Mở file `lib/gemini.ts`, tìm hàm `analyzeUserIntent()` và `generateAIResponse()` để:
- Thêm các trường mới (size, gender, occasion...)
- Tinh chỉnh cách AI hiểu câu hỏi
- Thay đổi tone của AI (formal vs casual)

### Thêm Tính Năng
- [ ] AI nhớ context (multi-turn conversation)
- [ ] Voice input
- [ ] Image search (upload ảnh → tìm sản phẩm tương tự)
- [ ] Share sản phẩm từ chat
- [ ] Save favorite products từ chat

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@google/generative-ai'"
```bash
npm install @google/generative-ai
```

### Lỗi: "API Key not valid"
- Kiểm tra API key trong `lib/gemini.ts`
- Đảm bảo API key đúng format
- Thử tạo API key mới tại https://makersuite.google.com/app/apikey

### AI không trả lời hoặc trả lời sai
- Kiểm tra internet connection
- Xem console log để debug
- Thử thay đổi prompt trong `lib/gemini.ts`

### Lưu lịch sử không hoạt động
- Kiểm tra Firebase config trong `firebase/firebaseConfig.ts`
- Đảm bảo Firestore Rules cho phép read/write
- Xem console log để kiểm tra error

## 📝 Cấu Trúc File

```
lib/
  └── gemini.ts              # Gemini AI service

context/
  └── ChatContext.tsx        # Chat state management

components/chat/
  ├── ChatBubble.tsx         # Tin nhắn chat
  └── ChatProductCard.tsx    # Sản phẩm trong chat

app/(main)/
  └── ai-chat.tsx            # Màn hình AI Chat
```

## 🎨 Customization

### Thay Đổi Màu Sắc
Mở `app/(main)/ai-chat.tsx` và `components/chat/ChatBubble.tsx`, tìm các giá trị màu (#5B9EE1, #FFFFFF...) và thay đổi.

### Thay Đổi Avatar
- AI Avatar: `components/chat/ChatBubble.tsx` → `aiAvatarText`
- User Avatar: `components/chat/ChatBubble.tsx` → `userAvatarText`

Thay emoji hoặc thêm image component.

## 💡 Tips

1. **Hỏi cụ thể hơn** → AI trả lời chính xác hơn
2. **Kết hợp nhiều tiêu chí**: "Nike Air Jordan màu đỏ dưới 5 triệu"
3. **Dùng số tiền cụ thể**: "3 triệu", "dưới 4 triệu", "từ 2 đến 3 triệu"

---

Made with ❤️ using Gemini AI & Firebase
