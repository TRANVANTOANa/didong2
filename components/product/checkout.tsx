// app/checkout.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { createMomoPayment } from "../../utils/momo";
import storage from "../../utils/storage";

interface AppliedVoucher {
    code: string;
    discount: number;
    discountType: "PERCENTAGE" | "FIXED";
    maxDiscountAmount?: string;
}

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, clearCart } = useCart();

    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );
    const shipping = items.length > 0 ? 40.99 : 0;


    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "momo">("cod");
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<AppliedVoucher | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            loadSavedVoucher();
        }, [])
    );

    const loadSavedVoucher = async () => {
        try {
            const savedVoucher = await storage.getItem("selectedVoucher");
            if (savedVoucher) {
                setSelectedVoucher(JSON.parse(savedVoucher));
            }
        } catch (error) {
            console.error("Error loading voucher:", error);
        }
    };

    // Calculate discount
    let discount = 0;
    if (selectedVoucher) {
        if (selectedVoucher.discountType === "PERCENTAGE") {
            discount = (subtotal * selectedVoucher.discount) / 100;
            if (selectedVoucher.maxDiscountAmount) {
                const maxDiscount = parseFloat(selectedVoucher.maxDiscountAmount);
                discount = Math.min(discount, maxDiscount);
            }
        } else {
            discount = selectedVoucher.discount;
        }
    }

    const total = Math.max(0, subtotal + shipping - discount);

    const handlePay = async () => {
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

        if (paymentMethod === "momo") {
            try {
                setIsProcessing(true);
                const orderId = "MOMO" + new Date().getTime();
                const cleanTotal = Math.round(total).toString(); // MoMo expects integer amount for VND usually, but user snippet used string '50000'. 
                // Note: user sample uses VND. Items appear to be in USD ($). 
                // We should probably convert or just send the number as is (treated as VND).
                // Given the sample '50000' and items total ~$40, 40 VND is tiny.
                // Assuming the backend is test environment, we pass the raw number * 25000? 
                // Or just pass the number. Let's pass the number * 25000 to mimic VND conversion 
                // or just '50000' hardcoded if we want a safe test?
                // The prompt 'format price to USD' was a previous task. 
                // I'll assume current prices are USD. MoMo expects VND.
                // I will convert * 25000 approximately.
                const amountVND = (Math.round(total * 25000)).toString();

                const response = await createMomoPayment(
                    orderId,
                    amountVND,
                    "Payment for order " + orderId
                );

                if (response && response.payUrl) {
                    // Open MoMo App
                    const supported = await Linking.canOpenURL(response.payUrl);
                    if (supported) {
                        await Linking.openURL(response.payUrl);
                        // After opening, we can assume "pending" or success for this demo
                        // Let's ask user to confirm they paid? Or just clear cart.
                        Alert.alert(
                            "Payment Initiated",
                            "Please complete the payment in the MoMo app. After payment, click OK.",
                            [
                                {
                                    text: "I have paid",
                                    onPress: () => {
                                        clearCart();
                                        router.replace({
                                            pathname: "/product/order-success",
                                            params: {
                                                total: total.toFixed(2),
                                                name: fullName,
                                                itemCount: items.length.toString(),
                                            },
                                        });
                                    }
                                },
                                {
                                    text: "Cancel",
                                    style: "cancel"
                                }
                            ]
                        );
                    } else {
                        Alert.alert("Error", "Cannot open payment link: " + response.payUrl);
                    }
                } else {
                    Alert.alert("Payment Error", "Could not create payment: " + (response.message || "Unknown error"));
                }
            } catch (error) {
                Alert.alert("Error", "Payment creation failed.");
            } finally {
                setIsProcessing(false);
            }
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
                        {selectedVoucher && discount > 0 && (
                            <View style={styles.priceRow}>
                                <Text style={[styles.priceLabel, { color: "#10B981" }]}>
                                    Discount ({selectedVoucher.code})
                                </Text>
                                <Text style={[styles.priceValue, { color: "#10B981" }]}>
                                    -${discount.toFixed(2)}
                                </Text>
                            </View>
                        )}
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

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === "momo" && styles.paymentOptionActive,
                        ]}
                        onPress={() => setPaymentMethod("momo")}
                    >
                        <View style={styles.paymentIconWrapper}>
                            <Image
                                source={{ uri: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" }}
                                style={{ width: 32, height: 32 }}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={[styles.paymentTitle, paymentMethod === "momo" && styles.paymentTitleActive]}>
                                MoMo E-Wallet
                            </Text>
                            <Text style={styles.paymentDesc}>Fast & Secure Payment</Text>
                        </View>
                        <View style={[styles.radioOuter, paymentMethod === "momo" && styles.radioOuterActive]}>
                            {paymentMethod === "momo" && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Pay Now Button */}
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        items.length === 0 && { opacity: 0.5 },
                        isProcessing && { opacity: 0.7 }
                    ]}
                    disabled={items.length === 0 || isProcessing}
                    onPress={handlePay}
                >
                    <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.payText}>
                        {isProcessing ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
                    </Text>
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
