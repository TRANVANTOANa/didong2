# Tính năng Vouchers (Mã giảm giá)

## 📋 Tổng quan

Trang Vouchers cho phép người dùng xem, lưu và quản lý mã giảm giá. Giao diện được thiết kế theo phong cách hiện đại với nhiều hiệu ứng và animation.

## ✨ Tính năng chính

### 1. **Xem danh sách voucher**
- Hiển thị tất cả voucher đang active từ Firebase
- Hiển thị thông tin chi tiết: mã, giảm giá, điều kiện, hạn sử dụng
- UI đẹp với badge màu sắc phân biệt loại voucher (phần trăm/cố định)

### 2. **Lưu voucher**
- Người dùng có thể lưu voucher yêu thích vào kho của mình
- Voucher đã lưu được đồng bộ với Firebase (collection: `users/{uid}/savedVouchers`)
- Hiển thị trạng thái "Đã lưu" với nút màu xanh lá

### 3. **Tab phân loại**
- **Tất cả voucher**: Hiển thị tất cả voucher có sẵn
- **Voucher của tôi**: Chỉ hiển thị voucher đã lưu
- Badge hiển thị số lượng voucher ở mỗi tab

### 4. **Sao chép mã**
- Nhấn vào icon copy để sao chép mã voucher
- Hiển thị thông báo xác nhận khi sao chép thành công

### 5. **Làm mới dữ liệu**
- Pull-to-refresh để tải lại danh sách voucher
- Tự động đồng bộ voucher đã lưu

## 🎨 Thiết kế UI

### Màu sắc
- **Voucher giảm theo %**: Badge màu xanh dương (#5B9EE1)
- **Voucher giảm cố định**: Badge màu xanh lá (#10B981)
- **Nút Lưu**: Border xanh dương (#5B9EE1)
- **Nút Đã lưu**: Nền xanh lá (#10B981)

### Thành phần UI
1. **Header**: Tiêu đề và nút back
2. **Tab Switcher**: Chuyển đổi giữa "Tất cả" và "Của tôi"
3. **Info Banner**: Hướng dẫn người dùng
4. **Voucher Card**: 
   - Phần trái: Badge hiển thị mức giảm giá
   - Đường ngăn cách chấm chấm (dashed)
   - Phần phải: Thông tin chi tiết voucher

## 🗂️ Cấu trúc dữ liệu Firebase

### Collection: `vouchers`
```typescript
{
  code: string;              // Mã voucher (VD: "SALE10")
  description: string;       // Mô tả voucher
  discount: number;          // Giá trị giảm (%)  hoặc số tiền
  discountType: "PERCENTAGE" | "FIXED";  // Loại giảm giá
  expiryDate: Timestamp;     // Ngày hết hạn
  isActive: boolean;         // Trạng thái kích hoạt
  maxDiscountAmount: string; // Số tiền giảm tối đa
  minOrderAmount: number;    // Giá trị đơn tối thiểu
  usageLimit: number;        // Giới hạn số lần sử dụng
  usedCount: number;         // Số lần đã sử dụng
  voucherType: string;       // Loại voucher (ORDER, SHIPPING, VIP...)
}
```

### Subcollection: `users/{uid}/savedVouchers`
```typescript
{
  voucherId: string;         // ID của voucher
  savedAt: Timestamp;        // Thời điểm lưu
}
```

## 🚀 Cách sử dụng

### 1. Truy cập trang Vouchers
- Vào **Settings** (Cài đặt)
- Click vào mục **"Mã giảm giá"** trong section **"Khuyến mãi"**

### 2. Xem và lưu voucher
- Xem danh sách voucher trong tab **"Tất cả voucher"**
- Nhấn nút **"Lưu"** để lưu voucher vào kho của bạn
- Chuyển sang tab **"Voucher của tôi"** để xem các voucher đã lưu

### 3. Sao chép mã voucher
- Nhấn vào icon **copy** bên cạnh mã voucher
- Mã sẽ được sao chép để sử dụng khi thanh toán

## 📝 Thêm voucher mẫu

Để thêm dữ liệu voucher mẫu vào Firebase:

```bash
npx tsx scripts/addSampleVouchers.ts
```

Script sẽ tự động thêm 8 voucher mẫu với các loại khác nhau.

## 🔧 Tích hợp vào Checkout

Để sử dụng voucher khi thanh toán, bạn cần:

1. Lấy danh sách voucher đã lưu của user
2. Cho phép user chọn voucher khi checkout
3. Validate voucher (kiểm tra hạn sử dụng, giá trị đơn tối thiểu)
4. Tính toán giá sau khi áp dụng voucher
5. Cập nhật `usedCount` khi thanh toán thành công

## 📱 Screenshots

### Màn hình Settings với mục Vouchers
- Section "Khuyến mãi" mới được thêm vào
- Icon ticket-outline màu xanh dương

### Màn hình Vouchers
- Tab switcher với số lượng voucher
- Info banner hướng dẫn
- Danh sách voucher card đẹp mắt
- Badge phân biệt loại voucher

### Empty State
- Hiển thị khi không có voucher
- Icon và text hướng dẫn thân thiện

## 🎯 Tính năng tương lai

- [ ] Tìm kiếm voucher theo mã
- [ ] Lọc voucher theo loại (ORDER, SHIPPING, VIP...)
- [ ] Thông báo khi có voucher mới
- [ ] Áp dụng voucher tự động ở trang checkout
- [ ] Lịch sử sử dụng voucher
- [ ] Chia sẻ voucher cho bạn bè

## 🐛 Lưu ý

- Người dùng cần đăng nhập để lưu voucher
- Voucher hết hạn vẫn hiển thị (có thể thêm filter để ẩn)
- Cần kiểm tra `isActive` và `expiryDate` trước khi áp dụng
- Badge số lượng được cập nhật real-time

---

**Tạo bởi**: Antigravity AI
**Ngày tạo**: 19/01/2026
