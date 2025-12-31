// app/order-status.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ORDER_STEPS = [
    { key: "confirmed", label: "Order Confirmed", description: "We have received your order." },
    { key: "processing", label: "Being Prepared", description: "Your items are being packed." },
    { key: "shipped", label: "Shipped", description: "Your order is on the way." },
    { key: "delivered", label: "Delivered", description: "Package will arrive soon." },
];

export default function OrderStatusScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        total?: string;
        itemCount?: string;
        orderId?: string;
        status?: string;
    }>();

    const total = params.total ?? "0.00";
    const itemCount = params.itemCount ?? "0";
    const orderId = params.orderId ?? "#SH-2025-0001";
    const status = params.status ?? "processing";

    // Map order status to step key
    const getStepKey = (orderStatus: string): string => {
        switch (orderStatus) {
            case "delivered":
                return "delivered";
            case "shipped":
                return "shipped";
            case "processing":
                return "processing";
            case "cancelled":
                return "confirmed"; // Show as confirmed but will handle separately
            default:
                return "confirmed";
        }
    };

    const currentStepKey = getStepKey(status);
    const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStepKey);

    return (
        <View style={styles.screen}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Order Summary card */}
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark" size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.title}>Payment Successful!</Text>
                    <Text style={styles.subtitle}>
                        Thank you! Your order has been placed successfully.
                    </Text>

                    <View style={styles.summaryBox}>
                        <View style={styles.summaryColumn}>
                            <Ionicons name="bag-outline" size={18} color="#64748B" />
                            <Text style={styles.summaryLabel}>Items</Text>
                            <Text style={styles.summaryValue}>{itemCount}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryColumn}>
                            <Ionicons name="card-outline" size={18} color="#64748B" />
                            <Text style={styles.summaryLabel}>Total Paid</Text>
                            <Text style={styles.summaryValue}>${Number(total).toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.orderInfoBox}>
                        <Ionicons
                            name="information-circle-outline"
                            size={20}
                            color="#F97316"
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
                            <Text style={styles.infoText}>
                                You will receive an order confirmation shortly. You can track
                                your order status on this page.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Timeline status */}
                <View style={[styles.card, { marginTop: 16 }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="bicycle-outline" size={18} color="#5B9EE1" />
                        <Text style={styles.cardHeaderText}>Tracking Progress</Text>
                    </View>

                    {ORDER_STEPS.map((step, index) => {
                        const isActive = index === currentIndex;
                        const isCompleted = index < currentIndex;

                        return (
                            <View key={step.key} style={styles.stepRow}>
                                <View style={styles.stepIndicatorWrapper}>
                                    <View
                                        style={[
                                            styles.stepCircle,
                                            (isActive || isCompleted) && styles.stepCircleActive,
                                        ]}
                                    >
                                        {isCompleted && (
                                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                        )}
                                    </View>
                                    {index !== ORDER_STEPS.length - 1 && (
                                        <View
                                            style={[
                                                styles.stepLine,
                                                isCompleted && styles.stepLineActive,
                                            ]}
                                        />
                                    )}
                                </View>

                                <View style={styles.stepTextWrapper}>
                                    <Text
                                        style={[
                                            styles.stepLabel,
                                            (isActive || isCompleted) && styles.stepLabelActive,
                                        ]}
                                    >
                                        {step.label}
                                    </Text>
                                    <Text style={styles.stepDescription}>
                                        {step.description}
                                    </Text>
                                    {isActive && (
                                        <Text style={styles.stepBadge}>Current status</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Actions */}
                <View style={{ marginTop: 16 }}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push("/(main)")}
                    >
                        <Ionicons
                            name="pricetags-outline"
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.primaryButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.replace("/(main)")}
                    >
                        <Ionicons
                            name="home-outline"
                            size={20}
                            color="#5B9EE1"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.secondaryButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 50,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        marginLeft: 12,
    },
    card: {
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        padding: 20,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#22C55E",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 16,
    },
    summaryBox: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: "center",
    },
    summaryColumn: {
        flex: 1,
        alignItems: "center",
    },
    summaryDivider: {
        width: 1,
        height: "100%",
        backgroundColor: "#E2E8F0",
    },
    summaryLabel: {
        fontSize: 12,
        color: "#94A3B8",
        marginTop: 4,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    orderInfoBox: {
        flexDirection: "row",
        borderRadius: 16,
        backgroundColor: "#FFFBEB",
        padding: 12,
        marginTop: 4,
    },
    orderIdText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 2,
    },
    infoText: {
        fontSize: 12,
        color: "#64748B",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        gap: 8,
    },
    cardHeaderText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0F172A",
    },
    stepRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    stepIndicatorWrapper: {
        width: 32,
        alignItems: "center",
    },
    stepCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    stepCircleActive: {
        backgroundColor: "#5B9EE1",
        borderColor: "#5B9EE1",
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: "#E2E8F0",
        marginTop: 2,
    },
    stepLineActive: {
        backgroundColor: "#5B9EE1",
    },
    stepTextWrapper: {
        flex: 1,
        paddingLeft: 8,
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#94A3B8",
    },
    stepLabelActive: {
        color: "#0F172A",
    },
    stepDescription: {
        fontSize: 12,
        color: "#94A3B8",
        marginTop: 2,
    },
    stepBadge: {
        marginTop: 6,
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: "600",
        color: "#0F172A",
        backgroundColor: "#E0F2FE",
    },
    primaryButton: {
        flexDirection: "row",
        borderRadius: 16,
        backgroundColor: "#5B9EE1",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    secondaryButton: {
        flexDirection: "row",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#5B9EE1",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        marginTop: 10,
        backgroundColor: "#FFFFFF",
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#5B9EE1",
    },
});
