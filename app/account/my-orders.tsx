// app/account/my-orders.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Order, fetchUserOrders } from "../../firebase/orders";

type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

const STATUS_LABEL: Record<OrderStatus, string> = {
    Processing: "Processing",
    Shipped: "Shipped",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
};

export default function MyOrdersScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [filter, setFilter] = useState<OrderStatus | "all">("all");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Handle back button - go home if no history
    const handleBack = () => {
        if (navigation.canGoBack()) {
            router.back();
        } else {
            router.replace("/(main)");
        }
    };

    // Fetch orders from Firebase
    const loadOrders = useCallback(async () => {
        try {
            const data = await fetchUserOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        loadOrders().finally(() => setLoading(false));
    }, [loadOrders]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {
        if (filter === "all") return orders;
        return orders.filter((o) => o.status === filter);
    }, [filter, orders]);

    // Format date
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const handleOpenOrder = (order: Order) => {
        router.push({
            pathname: "/product/order-status",
            params: {
                orderId: order.orderId,
                total: order.total.toFixed(2),
                itemCount: String(order.items.length),
                status: order.status.toLowerCase(),
            },
        });
    };

    if (loading) {
        return (
            <View style={[styles.screen, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#5B9EE1" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#5B9EE1"]}
                        tintColor="#5B9EE1"
                    />
                }
            >
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order History</Text>
                    <Text style={styles.summarySubtitle}>
                        You have {orders.length} orders.
                    </Text>
                </View>

                <View style={styles.filterRow}>
                    {["all", "Processing", "Shipped", "Delivered"].map((k) => {
                        const isActive = filter === k;
                        return (
                            <TouchableOpacity
                                key={k}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                                onPress={() => setFilter(k as any)}
                            >
                                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                    {k === "all" ? "All" : k}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {filteredOrders.map((order) => (
                    <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => handleOpenOrder(order)}>
                        <View style={styles.orderHeaderRow}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {/* Show first product image or icon */}
                                {order.items[0]?.imageUrl ? (
                                    <Image
                                        source={{ uri: order.items[0].imageUrl }}
                                        style={styles.orderImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.orderIconCircle}>
                                        <Ionicons name="receipt-outline" size={20} color="#5B9EE1" />
                                    </View>
                                )}
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.orderIdText}>Order {order.orderId}</Text>
                                    <Text style={styles.orderDateText}>{formatDate(order.createdAt)}</Text>
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
                                <Text style={styles.orderLabel}>
                                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                </Text>
                                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                            </View>

                            <View style={styles.orderCTA}>
                                <Text style={styles.orderCTAText}>View details</Text>
                                <Ionicons name="chevron-forward" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {filteredOrders.length === 0 && !loading && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#E2E8F0" />
                        <Text style={styles.emptyTitle}>No orders found</Text>
                        <Text style={styles.emptySubtitle}>
                            {orders.length === 0
                                ? "You haven't placed any orders yet."
                                : "Try changing the filter or place a new order."}
                        </Text>
                        {orders.length === 0 && (
                            <TouchableOpacity
                                style={styles.shopButton}
                                onPress={() => router.push("/(main)")}
                            >
                                <Text style={styles.shopButtonText}>Start Shopping</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function getStatusBadgeStyle(status: OrderStatus) {
    switch (status) {
        case "Delivered": return { backgroundColor: "#DCFCE7" };
        case "Shipped": return { backgroundColor: "#DBEAFE" };
        case "Processing": return { backgroundColor: "#FEF3C7" };
        case "Cancelled": return { backgroundColor: "#FEE2E2" };
        default: return {};
    }
}
function getStatusTextStyle(status: OrderStatus) {
    switch (status) {
        case "Delivered": return { color: "#16A34A" };
        case "Shipped": return { color: "#2563EB" };
        case "Processing": return { color: "#D97706" };
        case "Cancelled": return { color: "#DC2626" };
        default: return {};
    }
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 50, paddingHorizontal: 16 },
    loadingContainer: { justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: "#64748B" },
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
    orderIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
    orderImage: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F1F5F9" },
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
    shopButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#5B9EE1", borderRadius: 12 },
    shopButtonText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
