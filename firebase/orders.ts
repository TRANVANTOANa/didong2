// firebase/orders.ts
// Helper functions for managing orders in Firestore
import { addDoc, collection, doc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Order item type (sản phẩm trong đơn hàng)
export type OrderItem = {
    id: string;
    name: string;
    price: number;
    imageUrl: string; // URL hình ảnh từ Firebase
    size: string;
    qty: number;
};

// Order type (đơn hàng)
export type Order = {
    id?: string;
    orderId: string; // Mã đơn hàng: ORD + random
    userId: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: "cod" | "card" | "momo";
    createdAt: Date;
    review?: {
        rating: number;
        comment: string;
        createdAt: Date;
    };
};

/**
 * Generate unique order ID like "ORD120321"
 */
function generateOrderId(): string {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `ORD${random}`;
}

/**
 * Save order to Firestore
 * @param orderData - Order information without id and orderId
 * @returns The created order with id
 */
export async function saveOrder(orderData: Omit<Order, "id" | "orderId" | "userId" | "createdAt" | "status">): Promise<Order> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const newOrder: Omit<Order, "id"> = {
        ...orderData,
        orderId: generateOrderId(),
        userId: user.uid,
        status: "Processing",
        createdAt: new Date(),
    };

    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, {
        ...newOrder,
        createdAt: Timestamp.fromDate(newOrder.createdAt),
    });

    return {
        ...newOrder,
        id: docRef.id,
    };
}

/**
 * Fetch all orders for current user
 * @returns Array of orders sorted by date (newest first)
 */
export async function fetchUserOrders(): Promise<Order[]> {
    const user = auth.currentUser;
    if (!user) {
        return [];
    }

    const ordersRef = collection(db, "orders");
    // Only filter by userId - no orderBy to avoid requiring composite index
    const q = query(
        ordersRef,
        where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);
    const orders: Order[] = [];

    snapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
            id: doc.id,
            orderId: data.orderId,
            userId: data.userId,
            items: data.items || [],
            subtotal: data.subtotal || 0,
            shipping: data.shipping || 0,
            total: data.total || 0,
            status: data.status || "Processing",
            customerName: data.customerName || "",
            phone: data.phone || "",
            address: data.address || "",
            paymentMethod: data.paymentMethod || "cod",
            createdAt: data.createdAt?.toDate() || new Date(),
            review: data.review ? {
                ...data.review,
                createdAt: data.review.createdAt?.toDate() || new Date()
            } : undefined,
        });
    });

    // Sort by createdAt in client-side (newest first)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return orders;
}

/**
 * Cancel an order
 * @param orderId Document ID of the order to cancel
 */
export async function cancelOrder(orderId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: "Cancelled"
    });
}

/**
 * Submit a review for an order
 */
export async function submitOrderReview(orderId: string, review: { rating: number, comment: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const timestamp = Timestamp.now();

    // 1. Save to separate reviews collection (Correct Structure)
    await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        orderId: orderId,
        rating: review.rating,
        comment: review.comment,
        createdAt: timestamp,
        userEmail: user.email // Optional: store email for admin convenience
    });

    // 2. Update order document (for UI convenience/denormalization)
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        review: {
            ...review,
            createdAt: timestamp
        }
    });
}

// Review type for product reviews
export type ProductReview = {
    id: string;
    userId: string;
    userEmail?: string;
    orderId: string;
    productId?: string;
    rating: number;
    comment: string;
    createdAt: Date;
};

/**
 * Fetch reviews for a specific product
 * @param productId - Product ID to fetch reviews for
 * @returns Array of reviews sorted by date (newest first)
 */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
    const reviewsRef = collection(db, "reviews");
    const snapshot = await getDocs(reviewsRef);
    const reviews: ProductReview[] = [];

    // Get all orders to match productId with orderId
    const ordersRef = collection(db, "orders");
    const ordersSnapshot = await getDocs(ordersRef);

    // Create a map of orderId -> productIds in that order
    const orderProductMap: Record<string, string[]> = {};
    ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        const productIds = (data.items || []).map((item: { id: string }) => item.id);
        orderProductMap[doc.id] = productIds;
    });

    snapshot.forEach((doc) => {
        const data = doc.data();
        // Check if this review's order contains the product
        const orderProducts = orderProductMap[data.orderId] || [];
        if (orderProducts.includes(productId)) {
            reviews.push({
                id: doc.id,
                userId: data.userId,
                userEmail: data.userEmail,
                orderId: data.orderId,
                productId: productId,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.createdAt?.toDate() || new Date(),
            });
        }
    });

    // Sort by createdAt (newest first)
    reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return reviews;
}
