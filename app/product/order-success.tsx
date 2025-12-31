// app/order-success.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Order Success screen
 * - "Continue Shopping" -> products list
 * - "View Order" -> order-status page with params: orderId, total, itemCount
 *
 * If the caller didn't pass an orderId via query, we generate a short one here.
 */

export default function OrderSuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        total?: string;
        name?: string;
        itemCount?: string;
        orderId?: string;
    }>();

    const total = params.total ?? "0.00";
    const customerName = params.name ?? "Customer";
    const itemCount = params.itemCount ?? "0";
    // if orderId not provided, generate a short id (e.g. ORD123456)
    const orderId =
        params.orderId ?? `ORD${String(Date.now()).slice(-6)}`;

    // Animation
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate check icon
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Fade in content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    // Điều hướng: quay về danh sách sản phẩm
    const handleContinueShopping = () => {
        router.replace("/(main)");
    };

    // Điều hướng: quay về màn hình chính
    const handleBackToHome = () => {
        router.replace("/(main)");
    };

    // Điều hướng: sang màn order status với params
    const handleViewOrder = () => {
        router.push({
            pathname: "/product/order-status",
            params: {
                orderId,
                total: Number(total).toFixed(2),
                itemCount: String(itemCount),
            },
        });
    };

    return (
        <View style={styles.screen}>
            {/* Success Card */}
            <View style={styles.card}>
                {/* Animated Check Icon */}
                <Animated.View
                    style={[
                        styles.iconWrapper,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                    </View>
                </Animated.View>

                {/* Content */}
                <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
                    <Text style={styles.title}>Payment Successful!</Text>
                    <Text style={styles.subtitle}>
                        Thank you, {customerName}! Your order has been placed successfully.
                    </Text>

                    {/* Order Info Box */}
                    <View style={styles.orderInfoBox}>
                        <View style={styles.orderInfoRow}>
                            <View style={styles.orderInfoItem}>
                                <Ionicons name="bag-check-outline" size={24} color="#5B9EE1" />
                                <Text style={styles.orderInfoLabel}>Items</Text>
                                <Text style={styles.orderInfoValue}>{itemCount}</Text>
                            </View>
                            <View style={styles.orderInfoDivider} />
                            <View style={styles.orderInfoItem}>
                                <Ionicons name="card-outline" size={24} color="#5B9EE1" />
                                <Text style={styles.orderInfoLabel}>Total Paid</Text>
                                <Text style={styles.orderInfoValue}>${Number(total).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Order Tracking Notice */}
                    <View style={styles.noticeBox}>
                        <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
                        <Text style={styles.noticeText}>
                            You will receive an order confirmation notification shortly. Track your order in the{" "}
                            <Text style={styles.noticeBold}>My Orders</Text> section.
                        </Text>
                    </View>

                    {/* Buttons */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleContinueShopping}
                    >
                        <Ionicons name="storefront-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryText}>Continue Shopping</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleViewOrder}
                    >
                        <Ionicons name="receipt-outline" size={20} color="#5B9EE1" style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryText}>View Order</Text>
                    </TouchableOpacity>

                    {/* Back to home as subtle alternative */}
                    <TouchableOpacity
                        style={[styles.linkButton]}
                        onPress={handleBackToHome}
                    >
                        <Text style={styles.linkText}>Back to Home</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Confetti-like decorations */}
            <View style={[styles.confetti, { top: "10%", left: "10%" }]}>
                <Ionicons name="star" size={20} color="#F59E0B" />
            </View>
            <View style={[styles.confetti, { top: "15%", right: "15%" }]}>
                <Ionicons name="heart" size={18} color="#EF4444" />
            </View>
            <View style={[styles.confetti, { bottom: "20%", left: "20%" }]}>
                <Ionicons name="sparkles" size={22} color="#8B5CF6" />
            </View>
            <View style={[styles.confetti, { bottom: "25%", right: "10%" }]}>
                <Ionicons name="gift" size={20} color="#10B981" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        width: "100%",
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: "center",
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    iconWrapper: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#10B981",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#10B981",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    // Order Info
    orderInfoBox: {
        width: "100%",
        borderRadius: 16,
        backgroundColor: "#F8FAFC",
        padding: 16,
        marginBottom: 20,
    },
    orderInfoRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    orderInfoItem: {
        alignItems: "center",
        flex: 1,
    },
    orderInfoDivider: {
        width: 1,
        height: 50,
        backgroundColor: "#E2E8F0",
    },
    orderInfoLabel: {
        fontSize: 12,
        color: "#94A3B8",
        marginTop: 6,
        marginBottom: 2,
    },
    orderInfoValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    // Notice
    noticeBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FFFBEB",
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#FEF3C7",
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        color: "#92400E",
        lineHeight: 18,
        marginLeft: 10,
    },
    noticeBold: {
        fontWeight: "700",
    },
    // Buttons
    primaryButton: {
        width: "100%",
        flexDirection: "row",
        borderRadius: 16,
        backgroundColor: "#5B9EE1",
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    primaryText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    secondaryButton: {
        width: "100%",
        flexDirection: "row",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#5B9EE1",
        backgroundColor: "#FFFFFF",
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    secondaryText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#5B9EE1",
    },
    linkButton: {
        marginTop: 6,
    },
    linkText: {
        fontSize: 14,
        color: "#64748B",
    },
    // Confetti decorations
    confetti: {
        position: "absolute",
        opacity: 0.6,
    },
});
