// Script to seed vouchers into Firebase Firestore
// Run this once to add all Lucky Spin vouchers to your database

import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Voucher data matching the Lucky Spin rewards
const vouchersToAdd = [
    {
        code: "SALE10",
        description: "Giảm 10% cho đơn hàng của bạn",
        discount: 10,
        discountType: "PERCENTAGE",
        minOrderAmount: 50,
        maxDiscountAmount: "20",
        usageLimit: 100,
        usedCount: 0,
        voucherType: "DISCOUNT",
        isActive: true,
    },
    {
        code: "FREESHIP",
        description: "Miễn phí vận chuyển cho đơn hàng",
        discount: 100,
        discountType: "PERCENTAGE",
        minOrderAmount: 30,
        maxDiscountAmount: "15",
        usageLimit: 200,
        usedCount: 0,
        voucherType: "SHIPPING",
        isActive: true,
    },
    {
        code: "WELCOME15",
        description: "Chào mừng! Giảm 15% cho đơn đầu tiên",
        discount: 15,
        discountType: "PERCENTAGE",
        minOrderAmount: 40,
        maxDiscountAmount: "30",
        usageLimit: 500,
        usedCount: 0,
        voucherType: "WELCOME",
        isActive: true,
    },
    {
        code: "VIP100",
        description: "Giảm $100 cho khách hàng VIP",
        discount: 100,
        discountType: "FIXED",
        minOrderAmount: 300,
        maxDiscountAmount: "100",
        usageLimit: 50,
        usedCount: 0,
        voucherType: "VIP",
        isActive: true,
    },
    {
        code: "FLASH20",
        description: "Flash Sale! Giảm 20% - Chỉ hôm nay",
        discount: 20,
        discountType: "PERCENTAGE",
        minOrderAmount: 60,
        maxDiscountAmount: "40",
        usageLimit: 100,
        usedCount: 0,
        voucherType: "FLASH_SALE",
        isActive: true,
    },
    {
        code: "MEMBER25",
        description: "Ưu đãi thành viên - Giảm 25%",
        discount: 25,
        discountType: "PERCENTAGE",
        minOrderAmount: 80,
        maxDiscountAmount: "50",
        usageLimit: 150,
        usedCount: 0,
        voucherType: "MEMBER",
        isActive: true,
    },
    {
        code: "BIRTHDAY",
        description: "Chúc mừng sinh nhật! Giảm 30%",
        discount: 30,
        discountType: "PERCENTAGE",
        minOrderAmount: 50,
        maxDiscountAmount: "60",
        usageLimit: 100,
        usedCount: 0,
        voucherType: "BIRTHDAY",
        isActive: true,
    },
    {
        code: "SUPER30",
        description: "Siêu giảm giá 30% cho đơn hàng lớn",
        discount: 30,
        discountType: "PERCENTAGE",
        minOrderAmount: 100,
        maxDiscountAmount: "80",
        usageLimit: 80,
        usedCount: 0,
        voucherType: "SUPER_SALE",
        isActive: true,
    },
];

// Function to seed vouchers
export async function seedVouchers() {
    console.log("🚀 Starting to seed vouchers...");

    // Set expiry date to 6 months from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    for (const voucher of vouchersToAdd) {
        try {
            const voucherRef = doc(collection(db, "vouchers"));
            await setDoc(voucherRef, {
                ...voucher,
                expiryDate: Timestamp.fromDate(expiryDate),
                createdAt: Timestamp.now(),
            });
            console.log(`✅ Added voucher: ${voucher.code}`);
        } catch (error) {
            console.error(`❌ Error adding voucher ${voucher.code}:`, error);
        }
    }

    console.log("🎉 Voucher seeding completed!");
}

// To run this, you can call seedVouchers() from a component or use the button below
