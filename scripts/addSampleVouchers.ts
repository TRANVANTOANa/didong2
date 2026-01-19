// scripts/addSampleVouchers.ts
// Script để thêm voucher mẫu vào Firebase Firestore

import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBzILHoIr4venYXTi_s79i0kP5CRwpSoyI",
    authDomain: "giay-762b5.firebaseapp.com",
    projectId: "giay-762b5",
    storageBucket: "giay-762b5.appspot.com",
    messagingSenderId: "335242184462",
    appId: "1:335242184462:web:90b980780839ad6ec9795f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleVouchers = [
    {
        code: "MA",
        description: "20% discount (maximum 50K) for orders from 100K",
        discount: 20,
        discountType: "PERCENTAGE",
        expiryDate: Timestamp.fromDate(new Date("2026-03-27")),
        isActive: true,
        maxDiscountAmount: "50000",
        minOrderAmount: 100000,
        usageLimit: 500,
        usedCount: 50,
        voucherType: "ORDER",
    },
    {
        code: "SALE10",
        description: "Giảm 10% cho đơn 100k, tối đa 50k",
        discount: 10,
        discountType: "PERCENTAGE",
        expiryDate: Timestamp.fromDate(new Date("2026-01-31")),
        isActive: true,
        maxDiscountAmount: "50000",
        minOrderAmount: 100000,
        usageLimit: 500,
        usedCount: 120,
        voucherType: "ORDER",
    },
    {
        code: "SALE20",
        description: "Giảm 20% cho đơn 200k, tối đa 100k",
        discount: 20,
        discountType: "PERCENTAGE",
        expiryDate: Timestamp.fromDate(new Date("2026-02-02")),
        isActive: true,
        maxDiscountAmount: "100000",
        minOrderAmount: 200000,
        usageLimit: 300,
        usedCount: 89,
        voucherType: "ORDER",
    },
    {
        code: "GIAM30K",
        description: "Giảm ngay 30k cho đơn từ 150k",
        discount: 30000,
        discountType: "FIXED",
        expiryDate: Timestamp.fromDate(new Date("2026-01-23")),
        isActive: true,
        maxDiscountAmount: "30000",
        minOrderAmount: 150000,
        usageLimit: 150,
        usedCount: 45,
        voucherType: "ORDER",
    },
    {
        code: "FREESHIP",
        description: "Miễn phí vận chuyển cho đơn từ 200k",
        discount: 20000,
        discountType: "FIXED",
        expiryDate: Timestamp.fromDate(new Date("2026-02-15")),
        isActive: true,
        maxDiscountAmount: "20000",
        minOrderAmount: 200000,
        usageLimit: 1000,
        usedCount: 350,
        voucherType: "SHIPPING",
    },
    {
        code: "NEWUSER",
        description: "Ưu đãi 50k cho khách hàng mới",
        discount: 50000,
        discountType: "FIXED",
        expiryDate: Timestamp.fromDate(new Date("2026-12-31")),
        isActive: true,
        maxDiscountAmount: "50000",
        minOrderAmount: 100000,
        usageLimit: 10000,
        usedCount: 2450,
        voucherType: "NEW_USER",
    },
    {
        code: "GIAM30",
        description: "Giảm 30% cho đơn từ 500k, tối đa 150k",
        discount: 30,
        discountType: "PERCENTAGE",
        expiryDate: Timestamp.fromDate(new Date("2026-03-01")),
        isActive: true,
        maxDiscountAmount: "150000",
        minOrderAmount: 500000,
        usageLimit: 200,
        usedCount: 78,
        voucherType: "ORDER",
    },
    {
        code: "VIP100",
        description: "Giảm 100k cho khách VIP đơn từ 1 triệu",
        discount: 100000,
        discountType: "FIXED",
        expiryDate: Timestamp.fromDate(new Date("2026-06-30")),
        isActive: true,
        maxDiscountAmount: "100000",
        minOrderAmount: 1000000,
        usageLimit: 50,
        usedCount: 12,
        voucherType: "VIP",
    },
];

async function addVouchers() {
    console.log("🚀 Bắt đầu thêm voucher mẫu vào Firebase...\n");

    try {
        const vouchersCollection = collection(db, "vouchers");

        for (const voucher of sampleVouchers) {
            const docRef = await addDoc(vouchersCollection, voucher);
            console.log(`✅ Đã thêm voucher: ${voucher.code} (ID: ${docRef.id})`);
        }

        console.log("\n🎉 Hoàn thành! Đã thêm tất cả voucher mẫu vào Firebase.");
        console.log(`📊 Tổng số voucher: ${sampleVouchers.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi khi thêm voucher:", error);
        process.exit(1);
    }
}

addVouchers();
