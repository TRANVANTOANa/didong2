// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Khởi tạo Gemini AI
// Bạn cần thêm API key vào file .env hoặc sử dụng trực tiếp
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""; // Đọc từ .env
const genAI = new GoogleGenerativeAI(API_KEY);

export type Product = {
    id: string;
    name: string;
    price: string | number; // Cho phép cả string và number
    brand: string;
    category: string;
    color?: string;
    style?: string;
    tag?: string; // Thêm field tag để lọc sản phẩm (NEW, HOT, BEST SELLER)
    imageUrl: string;
    description: string;
};

export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    products?: Product[];
};

// Hàm lấy tất cả sản phẩm từ Firebase
async function getAllProducts(): Promise<Product[]> {
    try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name ?? "",
                price: data.price ?? 0,
                brand: data.brand ?? data.category ?? "",
                category: data.category ?? "",
                color: data.color ?? "",
                style: data.style ?? "",
                tag: data.tag ?? "", // Lấy tag từ Firebase (VD: "NEW,HOT,BEST SELLER")
                imageUrl: data.image ?? data.imageUrl ?? "", // Map 'image' field to 'imageUrl'
                description: data.description ?? "",
            };
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

// Hàm phân tích intent của người dùng
export async function analyzeUserIntent(userMessage: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Bạn là AI phân tích yêu cầu mua sắm giày dép. Phân tích câu sau và trích xuất thông tin:

Câu hỏi: "${userMessage}"

Trả về JSON có format sau (không thêm markdown):
{
  "brand": "tên thương hiệu (Nike, Adidas, Puma, v.v.) hoặc null",
  "color": "màu sắc (đỏ, xanh, đen, trắng, v.v.) hoặc null",
  "maxPrice": giá tối đa (số) hoặc null,
  "minPrice": giá tối thiểu (số) hoặc null,
  "style": "phong cách (streetwear, sport, casual, running, v.v.) hoặc null",
  "category": "loại giày (giày thể thao, giày chạy bộ, v.v.) hoặc null"
}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Loại bỏ markdown code block nếu có
        const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing intent:", error);

        // FALLBACK: Phân tích đơn giản bằng keyword matching
        return analyzeIntentFallback(userMessage);
    }
}

// Hàm fallback phân tích intent bằng keyword matching
function analyzeIntentFallback(userMessage: string): any {
    const msg = userMessage.toLowerCase();
    const intent: any = {};

    // Detect brand
    const brands = ['nike', 'adidas', 'puma', 'new balance', 'converse', 'vans'];
    for (const brand of brands) {
        if (msg.includes(brand)) {
            intent.brand = brand;
            break;
        }
    }

    // Detect color
    const colors = ['đỏ', 'xanh', 'đen', 'trắng', 'vàng', 'xám', 'nâu', 'hồng', 'blue', 'red', 'black', 'white'];
    for (const color of colors) {
        if (msg.includes(color)) {
            intent.color = color;
            break;
        }
    }

    // Detect price
    if (msg.includes('dưới') || msg.includes('duoi')) {
        const match = msg.match(/(\d+)\s*(tr|triệu|trieu|million)/i);
        if (match) {
            intent.maxPrice = parseInt(match[1]) * 1000000;
        }
    }

    if (msg.includes('từ') || msg.includes('tu')) {
        const match = msg.match(/từ\s*(\d+).*đến\s*(\d+)/i);
        if (match) {
            intent.minPrice = parseInt(match[1]) * 1000000;
            intent.maxPrice = parseInt(match[2]) * 1000000;
        }
    }

    // Detect style
    if (msg.includes('streetwear') || msg.includes('đường phố')) intent.style = 'streetwear';
    if (msg.includes('chạy bộ') || msg.includes('running')) intent.style = 'running';
    if (msg.includes('casual') || msg.includes('thường ngày')) intent.style = 'casual';

    // Detect tag (BEST SELLER, HOT, NEW)
    if (msg.includes('best seller') || msg.includes('bán chạy') || msg.includes('ban chay') || msg.includes('hot nhất')) {
        intent.tag = 'BEST SELLER';
    }
    if (msg.includes('hot') || msg.includes('xu hướng') || msg.includes('trending')) {
        intent.tag = intent.tag || 'HOT';
    }
    if (msg.includes('mới') || msg.includes('new') || msg.includes('hàng mới') || msg.includes('vừa về')) {
        intent.tag = intent.tag || 'NEW';
    }

    console.log('Fallback Intent:', intent);
    return intent;
}

// Hàm tìm kiếm sản phẩm dựa trên intent
export async function searchProducts(intent: any): Promise<Product[]> {
    const allProducts = await getAllProducts();

    return allProducts.filter((product) => {
        // Lọc theo tag (BEST SELLER, HOT, NEW)
        if (intent.tag) {
            const tagMatch = product.tag?.toUpperCase().includes(intent.tag.toUpperCase());
            if (!tagMatch) return false;
        }

        // Lọc theo brand
        if (intent.brand) {
            const brandMatch = product.brand?.toLowerCase().includes(intent.brand.toLowerCase());
            if (!brandMatch) return false;
        }

        // Lọc theo color
        if (intent.color) {
            const colorInName = product.name?.toLowerCase().includes(intent.color.toLowerCase());
            const colorInDesc = product.description?.toLowerCase().includes(intent.color.toLowerCase());
            const colorField = product.color?.toLowerCase().includes(intent.color.toLowerCase());
            if (!colorInName && !colorInDesc && !colorField) return false;
        }

        // Lọc theo giá - Xử lý cả string và number
        let price = 0;
        if (typeof product.price === 'string') {
            // Nếu là string, loại bỏ tất cả ký tự không phải số
            price = parseInt(product.price.replace(/[^0-9]/g, ""));
        } else if (typeof product.price === 'number') {
            price = product.price;
        }

        if (intent.maxPrice && price > intent.maxPrice) return false;
        if (intent.minPrice && price < intent.minPrice) return false;

        // Lọc theo style
        if (intent.style) {
            const styleInName = product.name?.toLowerCase().includes(intent.style.toLowerCase());
            const styleInDesc = product.description?.toLowerCase().includes(intent.style.toLowerCase());
            const styleField = product.style?.toLowerCase()?.includes(intent.style.toLowerCase());
            if (!styleInName && !styleInDesc && !styleField) return false;
        }

        // Lọc theo category
        if (intent.category) {
            const categoryMatch = product.category?.toLowerCase().includes(intent.category.toLowerCase());
            if (!categoryMatch) return false;
        }

        return true;
    });
}

// Hàm tạo câu trả lời AI với sản phẩm gợi ý
export async function generateAIResponse(
    userMessage: string,
    matchedProducts: Product[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = "";

    if (matchedProducts.length === 0) {
        prompt = `
Người dùng hỏi: "${userMessage}"

Không tìm thấy sản phẩm phù hợp. Hãy trả lời một cách thân thiện, xin lỗi và gợi ý họ thử tìm kiếm với các từ khóa khác hoặc mở rộng điều kiện tìm kiếm. Trả lời ngắn gọn, thân thiện, có emoji.
`;
    } else {
        const productList = matchedProducts.slice(0, 3).map((p, i) =>
            `${i + 1}. ${p.name} - ${p.brand} - $${formatPrice(p.price)}`
        ).join("\n");

        prompt = `
Người dùng hỏi: "${userMessage}"

Đã tìm thấy ${matchedProducts.length} sản phẩm phù hợp:
${productList}

Hãy viết câu trả lời tư vấn ngắn gọn (2-3 câu), thân thiện, gợi ý 1-2 sản phẩm phù hợp nhất. Nhấn mạnh ưu điểm về giá, style, hoặc thương hiệu. Sử dụng emoji cho sinh động. Không cần liệt kê đầy đủ sản phẩm.
`;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating AI response:", error);

        // FALLBACK: Generate simple response
        return generateFallbackResponse(userMessage, matchedProducts);
    }
}

// Hàm fallback tạo câu trả lời đơn giản
// Hàm fallback tạo câu trả lời đơn giản từ keyword
function generateFallbackResponse(userMessage: string, products: Product[]): string {
    const msg = userMessage.toLowerCase();

    // === GREETING RESPONSES ===
    if (msg.includes("chào") || msg.includes("hi") || msg.includes("hello") || msg.includes("xin chào")) {
        const greetings = [
            "Xin chào! 👋 Mình là trợ lý ảo hỗ trợ tìm giày. Bạn muốn tìm giày loại nào?",
            "Hello! 🙌 Chào mừng bạn đến cửa hàng! Hôm nay bạn muốn tìm đôi giày nào nhỉ?",
            "Hi bạn! 😊 Mình có thể giúp gì cho bạn? Tìm Nike, Adidas hay thương hiệu khác?",
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // === THANK YOU RESPONSES ===
    if (msg.includes("cảm ơn") || msg.includes("thank") || msg.includes("tks") || msg.includes("cam on")) {
        const thanks = [
            "Không có gì ạ! Cần tìm giày cứ ới mình nhé! 😉",
            "Rất vui được hỗ trợ bạn! 😊 Chúc bạn mua sắm vui vẻ!",
            "Đừng ngại, cứ hỏi mình bất cứ lúc nào nhé! 🤗",
        ];
        return thanks[Math.floor(Math.random() * thanks.length)];
    }

    // === GOODBYE RESPONSES ===
    if (msg.includes("bye") || msg.includes("tạm biệt") || msg.includes("tam biet") || msg.includes("goodbye")) {
        return "Tạm biệt bạn! Hẹn gặp lại nhé! 👋💙";
    }

    // === PRICE QUESTIONS ===
    if (msg.includes("bao nhiêu") || msg.includes("giá") || msg.includes("gia") || msg.includes("price")) {
        if (products.length > 0) {
            return `Giá ${products[0].name} là $${formatPrice(products[0].price)}. Bạn có thể xem chi tiết bên dưới! 💰`;
        }
        return "Bạn cho mình biết tên sản phẩm hoặc thương hiệu để mình báo giá nhé! 💵";
    }

    // === SIZE QUESTIONS ===
    if (msg.includes("size") || msg.includes("cỡ") || msg.includes("số")) {
        return "Shop có đầy đủ size từ 36-45! 📏 Bạn mang size bao nhiêu để mình tư vấn nhé?";
    }

    // === DELIVERY QUESTIONS ===
    if (msg.includes("giao hàng") || msg.includes("ship") || msg.includes("delivery") || msg.includes("vận chuyển")) {
        const deliveryResponses = [
            "Shop giao hàng toàn quốc! 🚚 Nội thành 1-2 ngày, tỉnh 3-5 ngày. Free ship cho đơn từ 1 triệu!",
            "Đơn hàng sẽ được giao trong 2-5 ngày làm việc. Miễn phí vận chuyển cho đơn từ 1.000.000đ! 📦",
        ];
        return deliveryResponses[Math.floor(Math.random() * deliveryResponses.length)];
    }

    // === RETURN/EXCHANGE QUESTIONS ===
    if (msg.includes("đổi") || msg.includes("trả") || msg.includes("return") || msg.includes("exchange") || msg.includes("bảo hành")) {
        return "Shop hỗ trợ đổi size trong 7 ngày và bảo hành 30 ngày! 🔄 Sản phẩm còn nguyên tem mác nhé!";
    }

    // === STORE LOCATION ===
    if (msg.includes("cửa hàng") || msg.includes("store") || msg.includes("địa chỉ") || msg.includes("shop ở đâu")) {
        return "Shop có 3 chi nhánh: Quận 1, Quận 3 và Quận 7 HCM! 📍 Mở cửa 9AM - 9PM hàng ngày.";
    }

    // === QUALITY QUESTIONS ===
    if (msg.includes("chất lượng") || msg.includes("authentic") || msg.includes("chính hãng") || msg.includes("real")) {
        return "100% sản phẩm chính hãng! ✅ Shop cam kết hoàn tiền 200% nếu phát hiện hàng fake!";
    }

    // === DISCOUNT/SALE QUESTIONS ===
    if (msg.includes("giảm giá") || msg.includes("sale") || msg.includes("khuyến mãi") || msg.includes("voucher") || msg.includes("mã giảm")) {
        return "Hiện shop đang có chương trình giảm 10-30% nhiều mẫu hot! 🔥 Bạn xem sản phẩm sale không?";
    }

    // === HOT/BEST SELLER === (Bỏ fallback cứng, để logic searchProducts xử lý)
    // Đã chuyển sang xử lý động bằng cách tìm sản phẩm có tag từ Firebase

    // === NEW ARRIVALS === (Bỏ fallback cứng, để logic searchProducts xử lý)
    // Đã chuyển sang xử lý động bằng cách tìm sản phẩm có tag từ Firebase

    // === RECOMMEND ===
    if (msg.includes("tư vấn") || msg.includes("gợi ý") || msg.includes("recommend") || msg.includes("suggest") || msg.includes("nên mua")) {
        return "Mình cần biết thêm: Bạn dùng để đi chơi, chạy bộ hay đi làm? Budget tầm bao nhiêu? 🤔";
    }

    // === PAYMENT ===
    if (msg.includes("thanh toán") || msg.includes("payment") || msg.includes("trả tiền") || msg.includes("chuyển khoản")) {
        return "Shop nhận thanh toán COD, chuyển khoản, và các ví MoMo, ZaloPay! 💳 Bạn muốn thanh toán bằng cách nào?";
    }

    // === CONTACT ===
    if (msg.includes("liên hệ") || msg.includes("contact") || msg.includes("hotline") || msg.includes("số điện thoại")) {
        return "Bạn có thể liên hệ hotline: 1900-xxxx hoặc inbox fanpage nhé! 📞 Mình hỗ trợ 24/7!";
    }

    // === SPORT-SPECIFIC ===
    if (msg.includes("chạy bộ") || msg.includes("running") || msg.includes("jogging")) {
        return "Giày chạy bộ hot nhất: Nike Pegasus, Adidas Ultraboost, ASICS Gel! 🏃 Bạn chạy đường dài hay ngắn?";
    }
    if (msg.includes("bóng đá") || msg.includes("football") || msg.includes("soccer")) {
        return "Giày bóng đá có: Nike Mercurial, Adidas Predator, Puma Future! ⚽ Bạn chơi sân cỏ nhân tạo hay tự nhiên?";
    }
    if (msg.includes("bóng rổ") || msg.includes("basketball")) {
        return "Giày bóng rổ: Jordan, Nike LeBron, Adidas Harden! 🏀 Bạn thích phong cách retro hay hiện đại?";
    }

    // === BRAND-SPECIFIC QUESTIONS ===
    if (msg.includes("nike")) {
        return "Nike có rất nhiều model hot! 🔥 Bạn thích Nike Air Max, Air Force 1, hay Dunk?";
    }
    if (msg.includes("adidas")) {
        return "Adidas đang có nhiều mẫu đẹp! 👟 Ultraboost để chạy, Samba để đi chơi, bạn thích style nào?";
    }
    if (msg.includes("jordan")) {
        return "Jordan collection: AJ1 classic, AJ4 retro! 🔴⚫ Bạn thích colorway nào?";
    }

    // === DEFAULT - NO PRODUCTS FOUND ===
    if (products.length === 0) {
        const noResultResponses = [
            "Xin lỗi, mình chưa tìm thấy sản phẩm phù hợp. Bạn thử tìm với tên thương hiệu hoặc màu sắc xem sao nhé! 😊",
            "Hmm, mình chưa hiểu lắm. Bạn thử hỏi cụ thể hơn như 'Giày Nike màu đen' nhé! 🤔",
            "Mình cần thêm thông tin! Bạn cho mình biết thương hiệu, màu sắc, hoặc ngân sách nhé! 💭",
        ];
        return noResultResponses[Math.floor(Math.random() * noResultResponses.length)];
    }

    // === PRODUCTS FOUND ===
    const firstProduct = products[0];
    const count = products.length;

    if (count === 1) {
        return `Mình tìm thấy ${firstProduct.name} của ${firstProduct.brand}, giá $${formatPrice(firstProduct.price)}. Bạn xem thử nhé! 👟`;
    }

    const responses = [
        `Mình tìm thấy ${count} sản phẩm phù hợp! 🎉 Gợi ý cho bạn ${firstProduct.name} từ ${firstProduct.brand}. Xem danh sách bên dưới nhé!`,
        `Wow, có ${count} đôi phù hợp với yêu cầu của bạn! 🔥 Top pick: ${firstProduct.name}!`,
        `Tuyệt vời! ${count} sản phẩm match với bạn. Đặc biệt là ${firstProduct.name} đang được yêu thích! ❤️`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Hàm format giá (USD)
function formatPrice(price: string | number): string {
    let num = 0;
    if (typeof price === 'string') {
        num = parseFloat(price.replace(/[^0-9.]/g, ""));
    } else {
        num = price;
    }

    // Format USD với 2 chữ số thập phân nếu cần
    if (num % 1 === 0) {
        return num.toString();
    }
    return num.toFixed(2);
}

// Hàm chính xử lý chat
// Hàm chính xử lý chat
export async function processUserMessage(userMessage: string): Promise<{
    aiResponse: string;
    products: Product[];
}> {
    try {
        // 1. Phân tích intent
        const intent = await analyzeUserIntent(userMessage);
        console.log("Intent:", intent);

        // Check nếu intent rỗng (không có filter nào)
        const hasIntent = intent.brand || intent.color || intent.maxPrice || intent.minPrice || intent.style || intent.category || intent.tag;

        let products: Product[] = [];

        // Chỉ tìm kiếm nếu có intent rõ ràng
        if (hasIntent) {
            // 2. Tìm kiếm sản phẩm
            products = await searchProducts(intent);
            console.log(`Found ${products.length} products`);
        }

        // 3. Tạo câu trả lời AI
        const aiResponse = await generateAIResponse(userMessage, products);

        return {
            aiResponse,
            products: products.slice(0, 5), // Giới hạn 5 sản phẩm
        };
    } catch (error) {
        console.error("Error processing message:", error);
        return {
            aiResponse: "Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé! 😓",
            products: [],
        };
    }
}
