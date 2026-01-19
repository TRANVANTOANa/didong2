import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    Timestamp,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";

const { width } = Dimensions.get("window");

interface Voucher {
    id: string;
    code: string;
    description: string;
    discount: number;
    discountType: "PERCENTAGE" | "FIXED";
    expiryDate: Timestamp;
    isActive: boolean;
    maxDiscountAmount: string;
    minOrderAmount: number;
    usageLimit: number;
    usedCount: number;
    voucherType: string;
}

export default function HomeVoucherSection() {
    const router = useRouter();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [savedVoucherIds, setSavedVoucherIds] = useState<string[]>([]);
    const [hiddenVoucherIds, setHiddenVoucherIds] = useState<string[]>([]); // New state for hidden vouchers
    const [loading, setLoading] = useState(true);
    const [savingVoucherId, setSavingVoucherId] = useState<string | null>(null);

    useEffect(() => {
        fetchVouchers();
        fetchSavedVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const vouchersQuery = query(
                collection(db, "vouchers"),
                where("isActive", "==", true)
            );
            const snapshot = await getDocs(vouchersQuery);
            const voucherList: Voucher[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                voucherList.push({
                    id: doc.id,
                    code: data.code,
                    description: data.description,
                    discount: data.discount,
                    discountType: data.discountType,
                    expiryDate: data.expiryDate,
                    isActive: data.isActive,
                    maxDiscountAmount: data.maxDiscountAmount,
                    minOrderAmount: data.minOrderAmount,
                    usageLimit: data.usageLimit,
                    usedCount: data.usedCount,
                    voucherType: data.voucherType,
                });
            });
            setVouchers(voucherList);
        } catch (error) {
            console.error("Error fetching vouchers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedVouchers = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const savedQuery = query(collection(db, "users", user.uid, "savedVouchers"));
            const snapshot = await getDocs(savedQuery);
            const ids = snapshot.docs.map((doc) => doc.data().voucherId);
            setSavedVoucherIds(ids);
        } catch (error) {
            console.error("Error fetching saved vouchers:", error);
        }
    };

    const handleSaveVoucher = async (voucher: Voucher) => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Notice", "Please login to save vouchers");
            router.push("/(auth)/login");
            return;
        }

        setSavingVoucherId(voucher.id);

        try {
            const savedRef = doc(db, "users", user.uid, "savedVouchers", voucher.id);
            const savedDoc = await getDoc(savedRef);

            if (savedDoc.exists()) {
                Alert.alert("Notice", "You have already saved this voucher!");
            } else {
                await setDoc(savedRef, {
                    voucherId: voucher.id,
                    savedAt: Timestamp.now(),
                });
                setSavedVoucherIds([...savedVoucherIds, voucher.id]);
                // Alert.alert("Success", "Voucher saved to your collection!"); 

                // Hide voucher after 5 seconds
                setTimeout(() => {
                    setHiddenVoucherIds((prev) => [...prev, voucher.id]);
                }, 5000);
            }
        } catch (error) {
            console.error("Error saving voucher:", error);
            Alert.alert("Error", "Could not save voucher");
        } finally {
            setSavingVoucherId(null);
        }
    };

    const formatPrice = (amount: number) => {
        return "$" + new Intl.NumberFormat("en-US").format(amount);
    };

    const getDiscountText = (voucher: Voucher) => {
        if (voucher.discountType === "PERCENTAGE") {
            return `${voucher.discount}% OFF`;
        }
        return `${formatPrice(voucher.discount)} OFF`;
    };

    if (loading) {
        return <ActivityIndicator size="small" color="#5B9EE1" style={{ marginVertical: 20 }} />;
    }

    if (vouchers.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vouchers For You</Text>
                <TouchableOpacity onPress={() => router.push("/account/vouchers")}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {vouchers
                    .filter((voucher) => !hiddenVoucherIds.includes(voucher.id)) // Filter hidden vouchers
                    .map((voucher) => {
                        const isSaved = savedVoucherIds.includes(voucher.id);
                        const isSaving = savingVoucherId === voucher.id;

                        return (
                            <View key={voucher.id} style={styles.voucherCard}>
                                {/* Left Side (Decoration) */}
                                <View style={styles.leftDecor}>
                                    <View style={styles.holeTop} />
                                    <View style={styles.holeBottom} />
                                    <View style={styles.dashedLine} />
                                </View>

                                {/* Content */}
                                <View style={styles.content}>
                                    <View style={styles.textContent}>
                                        <Text style={styles.discountText}>{getDiscountText(voucher)}</Text>
                                        <Text style={styles.codeText}>{voucher.code}</Text>
                                        <Text style={styles.minOrderText}>Min order: {formatPrice(voucher.minOrderAmount)}</Text>
                                    </View>

                                    {isSaved ? (
                                        <View style={styles.savedBadge}>
                                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                            <Text style={styles.savedText}>Saved</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={() => handleSaveVoucher(voucher)}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.saveButtonText}>Save</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    sectionHeader: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 4,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        letterSpacing: -0.3,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: "500",
        color: "#5B9EE1",
    },
    scrollView: {
        paddingBottom: 8,
    },
    scrollContent: {
        paddingLeft: 4,
        paddingRight: 16,
    },
    voucherCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginRight: 12,
        width: 260,
        height: 100,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    leftDecor: {
        width: 24,
        backgroundColor: "#EBF4FF",
        borderRightWidth: 1,
        borderRightColor: "#E2E8F0",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    holeTop: {
        position: "absolute",
        top: -6,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#F8FAFC", // Match background color of screen
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    holeBottom: {
        position: "absolute",
        bottom: -6,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    dashedLine: {
        position: "absolute",
        right: -1,
        top: 10,
        bottom: 10,
        width: 1,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#CBD5E1",
    },
    content: {
        flex: 1,
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    textContent: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
    },
    discountText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#EF4444", // Red like Shopee
    },
    codeText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        backgroundColor: "#F1F5F9",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: "hidden",
    },
    minOrderText: {
        fontSize: 11,
        color: "#64748B",
    },
    saveButton: {
        backgroundColor: "#EF4444", // Red button
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 70,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    savedBadge: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70,
        gap: 2,
    },
    savedText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#10B981",
    },
});
