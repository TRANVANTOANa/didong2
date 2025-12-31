// app/account/my-orders.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

type Order = {
    id: string;
    date: string;
    total: number;
    itemCount: number;
    status: OrderStatus;
};

// Demo data — thay bằng API/context khi có backend
const ORDER_HISTORY: Order[] = [
    { id: "ORD120321", date: "Feb 20, 2025", total: 533.99, itemCount: 1, status: "delivered" },
    { id: "ORD120287", date: "Feb 15, 2025", total: 898.99, itemCount: 2, status: "shipped" },
    { id: "ORD120201", date: "Feb 02, 2025", total: 259.49, itemCount: 1, status: "processing" },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export default function MyOrdersScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState<OrderStatus | "all">("all");

    const filteredOrders = useMemo(() => {
        if (filter === "all") return ORDER_HISTORY;
        return ORDER_HISTORY.filter((o) => o.status === filter);
    }, [filter]);

    const handleOpenOrder = (order: Order) => {
        // Chuyển sang màn order-status
        router.push({
            pathname: "/product/order-status",
            params: {
                orderId: order.id,
                total: order.total.toFixed(2),
                itemCount: String(order.itemCount),
                status: order.status,
            },
        });
    };

    return (
        <View style={styles.screen}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order History</Text>
                    <Text style={styles.summarySubtitle}>
                        You have {ORDER_HISTORY.length} orders.
                    </Text>
                </View>

                <View style={styles.filterRow}>
                    {["all", "processing", "shipped", "delivered"].map((k) => {
                        const isActive = filter === k;
                        return (
                            <TouchableOpacity
                                key={k}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                                onPress={() => setFilter(k as any)}
                            >
                                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                    {k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {filteredOrders.map((order) => (
                    <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => handleOpenOrder(order)}>
                        <View style={styles.orderHeaderRow}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={styles.orderIconCircle}>
                                    <Ionicons name="receipt-outline" size={20} color="#5B9EE1" />
                                </View>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.orderIdText}>Order {order.id}</Text>
                                    <Text style={styles.orderDateText}>{order.date}</Text>
                                </View>
                            </View>

                            <View style={[styles.statusBadge, getStatusBadgeStyle(order.status)]}>
                                <Text style={[styles.statusText, getStatusTextStyle(order.status)]}>
                                    {STATUS_LABEL[order.status]}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.orderBottomRow}>
                            <View>
                                <Text style={styles.orderLabel}>{order.itemCount} item{order.itemCount > 1 ? "s" : ""}</Text>
                                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                            </View>

                            <View style={styles.orderCTA}>
                                <Text style={styles.orderCTAText}>View details</Text>
                                <Ionicons name="chevron-forward" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {filteredOrders.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#E2E8F0" />
                        <Text style={styles.emptyTitle}>No orders found</Text>
                        <Text style={styles.emptySubtitle}>Try changing the filter or place a new order.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function getStatusBadgeStyle(status: OrderStatus) {
    switch (status) {
        case "delivered": return { backgroundColor: "#DCFCE7" };
        case "shipped": return { backgroundColor: "#DBEAFE" };
        case "processing": return { backgroundColor: "#FEF3C7" };
        case "cancelled": return { backgroundColor: "#FEE2E2" };
        default: return {};
    }
}
function getStatusTextStyle(status: OrderStatus) {
    switch (status) {
        case "delivered": return { color: "#16A34A" };
        case "shipped": return { color: "#2563EB" };
        case "processing": return { color: "#D97706" };
        case "cancelled": return { color: "#DC2626" };
        default: return {};
    }
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 50, paddingHorizontal: 16 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: "#0F172A", marginLeft: 12 },
    summaryCard: { borderRadius: 20, backgroundColor: "#FFFFFF", padding: 16, marginBottom: 12 },
    summaryTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
    summarySubtitle: { fontSize: 13, color: "#64748B" },
    filterRow: { flexDirection: "row", marginBottom: 12, flexWrap: "wrap", gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#E2E8F0" },
    filterChipActive: { backgroundColor: "#5B9EE1" },
    filterChipText: { fontSize: 12, color: "#475569", fontWeight: "500" },
    filterChipTextActive: { color: "#FFFFFF" },
    orderCard: { borderRadius: 18, backgroundColor: "#FFFFFF", padding: 14, marginBottom: 10 },
    orderHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    orderIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
    orderIdText: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
    orderDateText: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    statusText: { fontSize: 11, fontWeight: "600" },
    orderBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    orderLabel: { fontSize: 12, color: "#94A3B8", marginBottom: 2 },
    orderTotal: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
    orderCTA: { flexDirection: "row", alignItems: "center" },
    orderCTAText: { fontSize: 13, fontWeight: "600", color: "#3B82F6" },
    emptyContainer: { alignItems: "center", marginTop: 40 },
    emptyTitle: { fontSize: 16, fontWeight: "600", color: "#0F172A", marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: "#64748B", marginTop: 4, textAlign: "center", paddingHorizontal: 24 },
});
