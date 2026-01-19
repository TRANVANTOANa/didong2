// Quick script to add vouchers to Firebase
// Run with: node scripts/addVouchersQuick.mjs

import { initializeApp } from "firebase/app";
import { collection, doc, getDocs, getFirestore, query, setDoc, Timestamp, where } from "firebase/firestore";

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

const vouchers = [
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

async function seedVouchers() {
    console.log("🚀 Adding vouchers to Firebase...\n");

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    for (const voucher of vouchers) {
        try {
            // Check if exists
            const q = query(collection(db, "vouchers"), where("code", "==", voucher.code));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                console.log(`⚠️  ${voucher.code} already exists`);
                continue;
            }

            const voucherRef = doc(collection(db, "vouchers"));
            await setDoc(voucherRef, {
                ...voucher,
                expiryDate: Timestamp.fromDate(expiryDate),
                createdAt: Timestamp.now(),
            });
            console.log(`✅ Added: ${voucher.code}`);
        } catch (error) {
            console.log(`❌ Error: ${voucher.code}`, error.message);
        }
    }

    console.log("\n🎉 Done!");
    process.exit(0);
}

seedVouchers();
