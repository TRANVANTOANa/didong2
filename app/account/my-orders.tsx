// app/account/my-orders.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Order, cancelOrder, fetchUserOrders, submitOrderReview } from "../../firebase/orders";

type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";
const STATUS_LABEL: Record<OrderStatus, string> = {
    Processing: "Processing",
    Shipped: "Shipped",
    Delivered: "Delivered",
    Cancelled: "Cancelled",
};

type TabType = "all" | "processing" | "shipped" | "delivered" | "review" | "cancelled";

const TABS: { key: TabType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "review", label: "To Review" },
    { key: "cancelled", label: "Cancelled" },
];

export default function MyOrdersScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

    // View Review Modal
    const [viewReviewModalVisible, setViewReviewModalVisible] = useState(false);
    const [orderToViewReview, setOrderToViewReview] = useState<Order | null>(null);

    const handleViewReview = (order: Order) => {
        setOrderToViewReview(order);
        setViewReviewModalVisible(true);
    };

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
        switch (activeTab) {
            case "processing":
                return orders.filter((o) => o.status === "Processing");
            case "shipped":
                return orders.filter((o) => o.status === "Shipped");
            case "delivered":
                // Chỉ hiển thị đơn đã giao nhưng CHƯA đánh giá
                return orders.filter((o) => o.status === "Delivered" && !o.review);
            case "review":
                // Hiển thị tất cả đơn đã giao (để xem đánh giá hoặc viết đánh giá)
                return orders.filter((o) => o.status === "Delivered");
            case "cancelled":
                return orders.filter((o) => o.status === "Cancelled");
            default:
                return orders.filter((o) => o.status !== "Cancelled");
        }
    }, [activeTab, orders]);

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

    const handleCancelPress = (order: Order) => {
        setOrderToCancel(order);
        setCancelModalVisible(true);
    };

    const confirmCancelOrder = async () => {
        if (!orderToCancel?.id) return;

        try {
            setLoading(true);
            setCancelModalVisible(false); // Close modal first
            await cancelOrder(orderToCancel.id);
            await loadOrders();
            // Optional: Show success toast/alert if needed, but UI update is usually enough
        } catch (e) {
            Alert.alert("Error", "Failed to cancel order. Please try again.");
            console.error(e);
        } finally {
            setLoading(false);
            setOrderToCancel(null);
        }
    };

    const handleOpenReview = (order: Order) => {
        setSelectedOrder(order);
        setRating(5);
        setComment("");
        setReviewModalVisible(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedOrder?.id) return;
        if (!comment.trim()) {
            Alert.alert("Required", "Please write a comment.");
            return;
        }
        try {
            setSubmittingReview(true);
            await submitOrderReview(selectedOrder.id, { rating, comment });
            setReviewModalVisible(false);
            await loadOrders();
            Alert.alert("Success", "Thank you for your review!");
        } catch (e) {
            Alert.alert("Error", "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                                    onPress={() => setActiveTab(tab.key)}
                                >
                                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {filteredOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                        <TouchableOpacity onPress={() => handleOpenOrder(order)}>
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

                        {/* Actions Row */}
                        {(order.status === "Processing" || (order.status === "Delivered" && !order.review)) && (
                            <View style={styles.actionRow}>
                                {order.status === "Processing" && (
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelPress(order)}>
                                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === "Delivered" && !order.review && (
                                    <TouchableOpacity style={styles.reviewButton} onPress={() => handleOpenReview(order)}>
                                        <Text style={styles.reviewButtonText}>Write Review</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        {/* Show reviewed badge if reviewed - tappable to view full review */}
                        {order.status === "Delivered" && order.review && (
                            <TouchableOpacity
                                style={styles.reviewedBadgeRow}
                                onPress={() => handleViewReview(order)}
                            >
                                <View style={styles.reviewedBadge}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text style={styles.reviewedText}>Rated {order.review.rating}/5</Text>
                                </View>
                                <View style={styles.viewReviewButton}>
                                    <Text style={styles.viewReviewButtonText}>View Review</Text>
                                    <Ionicons name="chevron-forward" size={14} color="#5B9EE1" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
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

            {/* Review Modal */}
            <Modal
                visible={reviewModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rate & Review</Text>
                        <Text style={styles.modalSubtitle}>How was your experience?</Text>

                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons
                                        name={star <= rating ? "star" : "star-outline"}
                                        size={32}
                                        color="#F59E0B"
                                        style={{ marginHorizontal: 4 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write your review here..."
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelModalButton]}
                                onPress={() => setReviewModalVisible(false)}
                            >
                                <Text style={styles.cancelModalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitModalButton]}
                                onPress={handleSubmitReview}
                                disabled={submittingReview}
                            >
                                {submittingReview ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitModalButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal
                visible={cancelModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    <View style={[styles.modalContent, { borderRadius: 20, minHeight: 'auto', paddingBottom: 20 }]}>
                        <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Cancel Order?</Text>
                        <Text style={styles.modalSubtitle}>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelModalButton]}
                                onPress={() => setCancelModalVisible(false)}
                            >
                                <Text style={styles.cancelModalButtonText}>No, Keep it</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#EF4444' }]}
                                onPress={confirmCancelOrder}
                            >
                                <Text style={styles.submitModalButtonText}>Yes, Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* View Review Modal */}
            <Modal
                visible={viewReviewModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setViewReviewModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    <View style={[styles.modalContent, styles.viewReviewModalContent]}>
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setViewReviewModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Your Review</Text>
                        <Text style={styles.modalSubtitle}>Order {orderToViewReview?.orderId}</Text>

                        {/* Stars Display */}
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= (orderToViewReview?.review?.rating || 0) ? "star" : "star-outline"}
                                    size={32}
                                    color="#F59E0B"
                                    style={{ marginHorizontal: 4 }}
                                />
                            ))}
                        </View>
                        <Text style={styles.ratingText}>
                            {orderToViewReview?.review?.rating}/5 Stars
                        </Text>

                        {/* Comment Display */}
                        <View style={styles.commentDisplay}>
                            <Ionicons name="chatbubble-outline" size={16} color="#64748B" style={{ marginRight: 8 }} />
                            <Text style={styles.commentDisplayText}>
                                {orderToViewReview?.review?.comment || "No comment provided."}
                            </Text>
                        </View>

                        {/* Review Date */}
                        {orderToViewReview?.review?.createdAt && (
                            <Text style={styles.reviewDate}>
                                Reviewed on {formatDate(orderToViewReview.review.createdAt)}
                            </Text>
                        )}

                        <TouchableOpacity
                            style={[styles.modalButton, styles.submitModalButton, { marginTop: 20 }]}
                            onPress={() => setViewReviewModalVisible(false)}
                        >
                            <Text style={styles.submitModalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    filterRow: { marginBottom: 16 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: "#E2E8F0", marginRight: 0 },
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
    actionRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        marginTop: 12,
        paddingTop: 12,
        gap: 10,
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#FEE2E2",
    },
    cancelButtonText: {
        color: "#DC2626",
        fontSize: 13,
        fontWeight: "600",
    },
    reviewButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#5B9EE1",
    },
    reviewButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    reviewedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFBEB",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: "flex-start",
    },
    reviewedText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#D97706",
        marginLeft: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 350,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        marginTop: 4,
        marginBottom: 20,
    },
    starsRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
    },
    commentInput: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 16,
        height: 120,
        fontSize: 14,
        color: "#0F172A",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelModalButton: {
        backgroundColor: "#F1F5F9",
    },
    cancelModalButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#64748B",
    },
    submitModalButton: {
        backgroundColor: "#5B9EE1",
    },
    submitModalButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    // View Review Styles
    reviewedBadgeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        marginTop: 12,
        paddingTop: 12,
    },
    viewReviewButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    viewReviewButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#5B9EE1",
    },
    viewReviewModalContent: {
        borderRadius: 24,
        minHeight: "auto",
        paddingBottom: 24,
        marginHorizontal: 20,
    },
    closeModalButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748B",
        textAlign: "center",
        marginTop: -12,
        marginBottom: 20,
    },
    commentDisplay: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    commentDisplayText: {
        flex: 1,
        fontSize: 14,
        color: "#0F172A",
        lineHeight: 20,
    },
    reviewDate: {
        fontSize: 12,
        color: "#94A3B8",
        textAlign: "center",
        marginTop: 16,
    },
});
