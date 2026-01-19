// firebase/orders.ts
// Helper functions for managing orders in Firestore
import { addDoc, collection, getDocs, query, Timestamp, where } from "firebase/firestore";
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
        });
    });

    // Sort by createdAt in client-side (newest first)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return orders;
}
