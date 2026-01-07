// app/checkout.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useCart } from "../../context/CartContext";

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, clearCart } = useCart();

    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );
    const shipping = items.length > 0 ? 40.99 : 0;
    const total = subtotal + shipping;

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

    const handlePay = () => {
        if (!fullName.trim()) {
            Alert.alert("Missing Information", "Please enter your full name.");
            return;
        }
        if (!phone.trim()) {
            Alert.alert("Missing Information", "Please enter your phone number.");
            return;
        }
        if (!address.trim()) {
            Alert.alert("Missing Information", "Please enter your address.");
            return;
        }

        // Clear cart and navigate to success page
        clearCart();
        router.replace({
            pathname: "/product/order-success",
            params: {
                total: total.toFixed(2),
                name: fullName,
                itemCount: items.length.toString(),
            },
        });
    };

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
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.stepIndicator}>
                    <Text style={styles.stepText}>Step 2/2</Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Order Summary Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="receipt-outline" size={18} color="#5B9EE1" />
                        <Text style={styles.cardHeaderText}>Order Summary</Text>
                        <Text style={styles.itemCount}>{items.length} items</Text>
                    </View>

                    {/* Items Preview */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.itemsPreview}
                    >
                        {items.map((item) => (
                            <View key={`${item.id}-${item.size}`} style={styles.previewItem}>
                                <Image source={item.image} style={styles.previewImage} resizeMode="contain" />
                                <Text style={styles.previewQty}>x{item.qty}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Price Summary */}
                    <View style={styles.priceSummary}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Shipping</Text>
                            <Text style={styles.priceValue}>${shipping.toFixed(2)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.priceRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Shipping Info Card */}
                <View style={[styles.card, { marginTop: 16 }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location-outline" size={18} color="#5B9EE1" />
                        <Text style={styles.cardHeaderText}>Shipping Information</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={18} color="#94A3B8" />
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your full name"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={18} color="#94A3B8" />
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="Enter your phone number"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Delivery Address *</Text>
                        <View style={[styles.inputWrapper, { alignItems: "flex-start", paddingVertical: 12 }]}>
                            <Ionicons name="home-outline" size={18} color="#94A3B8" style={{ marginTop: 2 }} />
                            <TextInput
                                style={[styles.input, { height: 60, textAlignVertical: "top" }]}
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                placeholder="Street, City, Province..."
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>
                </View>

                {/* Payment Method Card */}
                <View style={[styles.card, { marginTop: 16 }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="wallet-outline" size={18} color="#5B9EE1" />
                        <Text style={styles.cardHeaderText}>Payment Method</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === "cod" && styles.paymentOptionActive,
                        ]}
                        onPress={() => setPaymentMethod("cod")}
                    >
                        <View style={styles.paymentIconWrapper}>
                            <Ionicons name="cash-outline" size={24} color={paymentMethod === "cod" ? "#5B9EE1" : "#64748B"} />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={[styles.paymentTitle, paymentMethod === "cod" && styles.paymentTitleActive]}>
                                Cash on Delivery
                            </Text>
                            <Text style={styles.paymentDesc}>Pay when you receive</Text>
                        </View>
                        <View style={[styles.radioOuter, paymentMethod === "cod" && styles.radioOuterActive]}>
                            {paymentMethod === "cod" && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === "card" && styles.paymentOptionActive,
                        ]}
                        onPress={() => setPaymentMethod("card")}
                    >
                        <View style={styles.paymentIconWrapper}>
                            <Ionicons name="card-outline" size={24} color={paymentMethod === "card" ? "#5B9EE1" : "#64748B"} />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={[styles.paymentTitle, paymentMethod === "card" && styles.paymentTitleActive]}>
                                Credit/Debit Card
                            </Text>
                            <Text style={styles.paymentDesc}>Visa, Mastercard, etc.</Text>
                        </View>
                        <View style={[styles.radioOuter, paymentMethod === "card" && styles.radioOuterActive]}>
                            {paymentMethod === "card" && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Pay Now Button */}
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        items.length === 0 && { opacity: 0.5 },
                    ]}
                    disabled={items.length === 0}
                    onPress={handlePay}
                >
                    <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.payText}>Place Order - ${total.toFixed(2)}</Text>
                </TouchableOpacity>
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
    stepIndicator: {
        backgroundColor: "#EBF4FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    stepText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#5B9EE1",
    },
    card: {
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        padding: 16,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 8,
    },
    cardHeaderText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#0F172A",
    },
    itemCount: {
        fontSize: 12,
        color: "#64748B",
    },
    // Items Preview
    itemsPreview: {
        marginBottom: 16,
    },
    previewItem: {
        width: 80,
        height: 80,
        borderRadius: 14,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        position: "relative",
        overflow: "visible",
    },
    previewImage: {
        width: 65,
        height: 65,
    },
    previewQty: {
        position: "absolute",
        bottom: 2,
        right: 2,
        backgroundColor: "#5B9EE1",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: "700",
        color: "#FFFFFF",
        minWidth: 24,
        textAlign: "center",
        overflow: "visible",
    },
    // Price Summary
    priceSummary: {
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 12,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    priceValue: {
        fontSize: 14,
        color: "#0F172A",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#5B9EE1",
    },
    // Input
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "500",
        color: "#64748B",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#0F172A",
    },
    // Payment
    paymentOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        marginBottom: 10,
    },
    paymentOptionActive: {
        borderColor: "#5B9EE1",
        backgroundColor: "#EBF4FF",
    },
    paymentIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 2,
    },
    paymentTitleActive: {
        color: "#5B9EE1",
    },
    paymentDesc: {
        fontSize: 12,
        color: "#94A3B8",
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
    },
    radioOuterActive: {
        borderColor: "#5B9EE1",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#5B9EE1",
    },
    // Pay Button
    payButton: {
        flexDirection: "row",
        marginTop: 20,
        borderRadius: 16,
        backgroundColor: "#5B9EE1",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    payText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
