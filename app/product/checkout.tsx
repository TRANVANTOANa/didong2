// app/checkout.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDoc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useCart } from "../../context/CartContext";
import { auth, db } from "../../firebase/firebaseConfig";
import { checkMomoTransactionStatus, createMomoPayment } from "../../utils/momo";
import storage from "../../utils/storage";

interface AppliedVoucher {
    id?: string;
    code: string;
    discount: number;
    discountType: "PERCENTAGE" | "FIXED";
    maxDiscountAmount?: string;
}

const { width } = Dimensions.get("window");

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

    const [isSubmitting, setIsSubmitting] = useState(false);

    // MoMo QR Dialog State
    // MoMo QR Dialog State
    const [showMomoQR, setShowMomoQR] = useState(false);
    const [momoPayUrl, setMomoPayUrl] = useState("");
    const [currentOrderId, setCurrentOrderId] = useState("");
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Auto-poll payment status
    useEffect(() => {
        let intervalId: any;

        if (showMomoQR && currentOrderId) {
            setIsCheckingStatus(true);
            intervalId = setInterval(async () => {
                console.log("Polling MoMo status for:", currentOrderId);
                const statusData = await checkMomoTransactionStatus(currentOrderId);

                if (statusData && statusData.resultCode === 0) {
                    console.log("Payment Successful!");
                    clearInterval(intervalId);
                    setShowMomoQR(false);
                    setIsCheckingStatus(false);
                    await finalizeOrder(fullName, phone, address, "momo", currentOrderId);
                }
            }, 5000); // Check every 5 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [showMomoQR, currentOrderId]);

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

        setIsSubmitting(true);

        try {
            if (paymentMethod === "momo") {
                const orderId = "MOMO" + new Date().getTime();
                // Convert to VND roughly for testing
                const amountVND = (Math.round(total * 25000)).toString();

                const momoResponse = await createMomoPayment(
                    orderId,
                    amountVND,
                    "Payment for order " + orderId
                );

                if (momoResponse && momoResponse.payUrl) {
                    // Set QR Data and Show Modal
                    console.log("Opening QR Modal with URL:", momoResponse.payUrl);

                    setMomoPayUrl(momoResponse.payUrl);
                    setCurrentOrderId(orderId);
                    setShowMomoQR(true);
                    setIsSubmitting(false); // Stop loading to show modal
                    return; // Wait for user interaction in Modal
                } else {
                    throw new Error(momoResponse.message || "MoMo payment creation failed");
                }
            }

            // Normal flow for COD and CARD (or after MoMo success if we handled it differently, but here we stop for QR)
            await finalizeOrder(fullName, phone, address, paymentMethod);

        } catch (error) {
            console.error("Error saving order:", error);
            Alert.alert(
                "Order Failed",
                "Could not save your order. Please try again."
            );
            setIsSubmitting(false);
        }
    };

    const finalizeOrder = async (
        pName: string,
        pPhone: string,
        pAddress: string,
        pMethod: "cod" | "card" | "momo",
        pOrderId?: string
    ) => {
        try {
            // Import and save order to Firebase
            const { saveOrder } = await import("../../firebase/orders");

            // Convert cart items to order items with imageUrl
            const orderItems = items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl || "", // Use Firebase image URL
                size: item.size,
                qty: item.qty,
            }));

            // If we have a pOrderId (from MoMo), we use it? 
            // The saveOrder function generates its own ID currently. 
            // We might want to pass the MoMo Order ID.
            // For now, let's keep the logic simple and just save.

            const order = await saveOrder({
                items: orderItems,
                subtotal,
                shipping,
                total,
                customerName: pName,
                phone: pPhone,
                address: pAddress,
                paymentMethod: pMethod,
            });

            console.log("Order saved successfully:", order.orderId);

            // Handle Voucher Usage
            if (selectedVoucher && auth.currentUser) {
                try {
                    // 1. Update User's Saved Voucher (Decrement or Delete)
                    const userVouchersRef = collection(db, "users", auth.currentUser.uid, "savedVouchers");

                    // Priority: Find by ID, then fallback to Code
                    let voucherDocSnapshot;

                    if (selectedVoucher.id) {
                        const docRef = doc(userVouchersRef, selectedVoucher.id);
                        voucherDocSnapshot = await getDoc(docRef);
                    }

                    // If not found by ID (e.g. old data), try finding by Code
                    if (!voucherDocSnapshot?.exists()) {
                        const q = query(userVouchersRef, where("code", "==", selectedVoucher.code));
                        const snapshot = await getDocs(q);
                        if (!snapshot.empty) voucherDocSnapshot = snapshot.docs[0];
                    }

                    if (voucherDocSnapshot && voucherDocSnapshot.exists()) {
                        const currentQty = voucherDocSnapshot.data().quantity || 1;

                        if (currentQty > 1) {
                            await updateDoc(voucherDocSnapshot.ref, {
                                quantity: increment(-1)
                            });
                            console.log(`Decremented voucher ${selectedVoucher.code} qty to ${currentQty - 1}`);
                        } else {
                            await deleteDoc(voucherDocSnapshot.ref);
                            console.log(`Removed voucher ${selectedVoucher.code} from user wallet`);
                        }
                    } else {
                        console.warn("Could not find voucher to delete:", selectedVoucher.code);
                    }

                    // 2. Increment Global Usage Count (Optional but recommended)
                    const globalVouchersRef = collection(db, "vouchers");
                    const globalQ = query(globalVouchersRef, where("code", "==", selectedVoucher.code));
                    const globalSnapshot = await getDocs(globalQ);

                    if (!globalSnapshot.empty) {
                        await updateDoc(globalSnapshot.docs[0].ref, {
                            usedCount: increment(1)
                        });
                    }

                } catch (voucherError) {
                    console.error("Error processing voucher usage:", voucherError);
                    // Don't block the order success flow for this
                }
            }

            // Clear cart and navigate to success page
            // Clear cart, voucher and navigate to success page
            clearCart();
            await storage.removeItem("selectedVoucher");
            router.replace({
                pathname: "/product/order-success",
                params: {
                    total: total.toFixed(2),
                    name: pName,
                    itemCount: items.length.toString(),
                    orderId: order.orderId,
                },
            });
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to finalize order.");
        } finally {
            setIsSubmitting(false);
            setShowMomoQR(false);
        }
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
                        (items.length === 0 || isSubmitting) && { opacity: 0.5 },
                    ]}
                    disabled={items.length === 0 || isSubmitting}
                    onPress={handlePay}
                >
                    <Ionicons
                        name={isSubmitting ? "hourglass-outline" : "checkmark-circle-outline"}
                        size={22}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.payText}>
                        {isSubmitting ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* MoMo QR Modal */}
            <Modal
                visible={showMomoQR}
                transparent
                animationType="slide"
                onRequestClose={() => setShowMomoQR(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thanh toán MoMo</Text>
                            <TouchableOpacity onPress={() => setShowMomoQR(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.qrContainer}>
                            <Text style={styles.qrLabel}>Quét mã để thanh toán</Text>
                            <View style={styles.qrWrapper}>
                                {momoPayUrl ? (
                                    <Image
                                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(momoPayUrl)}` }}
                                        style={{ width: 200, height: 200 }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={{ width: 200, height: 200, backgroundColor: '#f0f0f0' }} />
                                )}
                            </View>
                            <Text style={styles.priceValueLarge}>₫{(Math.round(total * 25000)).toLocaleString()}</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.openAppButton}
                                onPress={() => {
                                    if (momoPayUrl) Linking.openURL(momoPayUrl);
                                }}
                            >
                                <Text style={styles.openAppButtonText}>Mở App MoMo</Text>
                            </TouchableOpacity>

                            <View style={styles.statusContainer}>
                                <Ionicons name="sync" size={20} color="#64748B" style={styles.spinningIcon} />
                                <Text style={styles.statusText}>Đang chờ thanh toán...</Text>
                            </View>

                            {/* Hidden manual button for backup if needed, or remove completely */}
                            {/* <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => finalizeOrder(fullName, phone, address, "momo", currentOrderId)}
                            >
                                <Text style={styles.confirmButtonText}>Tôi đã thanh toán xong (Thủ công)</Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>
            </Modal>
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 1000,
    },
    modalContent: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    qrContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    qrLabel: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 16,
    },
    qrWrapper: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 16,
    },
    priceValueLarge: {
        fontSize: 24,
        fontWeight: "700",
        color: "#d82d8b", // MoMo pink color
    },
    modalActions: {
        width: "100%",
        gap: 12,
    },
    openAppButton: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: "#EBF4FF",
        alignItems: "center",
    },
    openAppButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#5B9EE1",
    },
    confirmButton: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: "#d82d8b", // MoMo pink
        alignItems: "center",
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        gap: 8,
    },
    statusText: {
        fontSize: 14,
        color: "#64748B",
    },
    spinningIcon: {
        // Simple rotation handle via Reanimated if needed, but static for now is okay or use ActivityIndicator
    }
});
