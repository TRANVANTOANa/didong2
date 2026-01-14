// scripts/addSampleProducts.ts
/**
 * Script để thêm sản phẩm mẫu vào Firebase với thông tin đầy đủ cho AI search
 * Run: npx ts-node scripts/addSampleProducts.ts
 */

import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const sampleProducts = [
    {
        name: "Nike Air Jordan 1 Blue",
        brand: "Nike",
        price: "3500000",
        category: "Giày thể thao",
        color: "xanh dương",
        style: "streetwear",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        description: "Giày Nike Air Jordan 1 màu xanh dương, phong cách streetwear, dễ phối đồ, phù hợp cho các bạn trẻ yêu thích thời trang đường phố.",
        gallery: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"
        ]
    },
    {
        name: "Adidas Ultraboost 22 Black",
        brand: "Adidas",
        price: "3200000",
        category: "Giày chạy bộ",
        color: "đen",
        style: "running",
        imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
        description: "Giày chạy bộ Adidas Ultraboost 22 màu đen, đế Boost siêu êm, hỗ trợ chạy bộ tốt.",
        gallery: [
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500"
        ]
    },
    {
        name: "Nike Air Max 270 White",
        brand: "Nike",
        price: "2800000",
        category: "Giày thể thao",
        color: "trắng",
        style: "casual",
        imageUrl: "https://images.unsplash.com/photo-1543508282-9652d79c7f1c?w=500",
        description: "Nike Air Max 270 màu trắng tinh khôi, phong cách casual, dễ phối đồ hằng ngày.",
        gallery: [
            "https://images.unsplash.com/photo-1543508282-9652d79c7f1c?w=500"
        ]
    },
    {
        name: "Puma RS-X Red",
        brand: "Puma",
        price: "2500000",
        category: "Giày thể thao",
        color: "đỏ",
        style: "streetwear",
        imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
        description: "Puma RS-X màu đỏ nổi bật, thiết kế chunky sneaker, phong cách streetwear năng động.",
        gallery: [
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500"
        ]
    },
    {
        name: "Adidas Stan Smith Green",
        brand: "Adidas",
        price: "2200000",
        category: "Giày thể thao",
        color: "xanh lá",
        style: "casual",
        imageUrl: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500",
        description: "Adidas Stan Smith với điểm nhấn xanh lá cây, phong cách minimalist, vượt thời gian.",
        gallery: [
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500"
        ]
    },
    {
        name: "Nike ZoomX Vaporfly Yellow",
        brand: "Nike",
        price: "4500000",
        category: "Giày chạy bộ",
        color: "vàng",
        style: "running",
        imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500",
        description: "Nike ZoomX Vaporfly màu vàng, giày chạy marathon chuyên nghiệp, siêu nhẹ.",
        gallery: [
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500"
        ]
    },
    {
        name: "New Balance 574 Grey",
        brand: "New Balance",
        price: "2600000",
        category: "Giày thể thao",
        color: "xám",
        style: "casual",
        imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500",
        description: "New Balance 574 màu xám, phong cách retro, thoải mái cho cả ngày dài.",
        gallery: [
            "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500"
        ]
    },
    {
        name: "Converse Chuck Taylor All Star Black",
        brand: "Converse",
        price: "1500000",
        category: "Giày thể thao",
        color: "đen",
        style: "casual",
        imageUrl: "https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=500",
        description: "Converse Chuck Taylor All Star màu đen kinh điển, phù hợp mọi phong cách.",
        gallery: [
            "https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=500"
        ]
    }
];

async function addProducts() {
    console.log("🚀 Bắt đầu thêm sản phẩm mẫu vào Firebase...\n");

    try {
        const productsRef = collection(db, "products");

        for (const product of sampleProducts) {
            const docRef = await addDoc(productsRef, product);
            console.log(`✅ Đã thêm: ${product.name} (${product.brand}) - ${product.color} - ${parseInt(product.price).toLocaleString('vi-VN')}₫`);
            console.log(`   ID: ${docRef.id}\n`);
        }

        console.log("🎉 Hoàn thành! Đã thêm tất cả sản phẩm vào Firebase.");
        console.log(`📦 Tổng số: ${sampleProducts.length} sản phẩm`);
    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
    }
}

// Run script
addProducts();
