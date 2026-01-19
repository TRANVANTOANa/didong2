// app/account/vouchers.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView, StyleSheet, Text,
    TouchableOpacity,
    View
} from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";
import storage from "../../utils/storage";

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

interface SavedVoucher {
    voucherId: string;
    savedAt: Timestamp;
    quantity?: number;
}

export default function VouchersScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [savedVoucherIds, setSavedVoucherIds] = useState<string[]>([]);
    const [savedVoucherQuantities, setSavedVoucherQuantities] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savingVoucherId, setSavingVoucherId] = useState<string | null>(null);

    // Animation values
    const slideAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (params.tab === 'saved') {
            switchTab('saved');
        }
    }, [params.tab]);

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
            Alert.alert("Lỗi", "Không thể tải danh sách voucher");
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedVouchers = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const savedRef = collection(db, "users", user.uid, "savedVouchers");
            const snapshot = await getDocs(savedRef);
            const savedIds: string[] = [];
            const quantities: Record<string, number> = {};
            snapshot.forEach((docSnap) => {
                savedIds.push(docSnap.id);
                const data = docSnap.data();
                quantities[docSnap.id] = data.quantity || 1;
            });
            setSavedVoucherIds(savedIds);
            setSavedVoucherQuantities(quantities);
        } catch (error) {
            console.error("Error fetching saved vouchers:", error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchVouchers(), fetchSavedVouchers()]);
        setRefreshing(false);
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
                    code: voucher.code,
                    label: voucher.description || "Voucher",
                    savedAt: Timestamp.now(),
                    quantity: 1,
                });
                setSavedVoucherIds([...savedVoucherIds, voucher.id]);
                Alert.alert(
                    "Success",
                    "Voucher saved to your collection!",
                    [
                        {
                            text: "View My Vouchers",
                            onPress: () => switchTab("saved"),
                        },
                        {
                            text: "OK",
                            style: "cancel",
                        },
                    ]
                );
            }
        } catch (error) {
            console.error("Error saving voucher:", error);
            Alert.alert("Error", "Could not save voucher");
        } finally {
            setSavingVoucherId(null);
        }
    };

    const handleCopyCode = (code: string) => {
        Alert.alert("Copied", `Code "${code}" has been copied!`);
    };

    const handleApplyVoucher = async (voucher: Voucher) => {
        try {
            const voucherData = {
                id: voucher.id,
                code: voucher.code,
                discount: voucher.discount,
                discountType: voucher.discountType,
                maxDiscountAmount: voucher.maxDiscountAmount,
            };
            await storage.setItem("selectedVoucher", JSON.stringify(voucherData));
            Alert.alert(
                "Success",
                `Voucher ${voucher.code} applied!`,
                [
                    {
                        text: "Go to Cart",
                        onPress: () => router.push("/(main)/cart"),
                    },
                    {
                        text: "OK",
                        style: "cancel",
                    },
                ]
            );
        } catch (error) {
            console.error("Error applying voucher:", error);
            Alert.alert("Error", "Could not apply voucher");
        }
    };

    const formatPrice = (amount: number) => {
        return "$" + new Intl.NumberFormat("en-US").format(amount);
    };

    const formatDate = (timestamp: Timestamp) => {
        const date = timestamp.toDate();
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
    };

    const getDiscountText = (voucher: Voucher) => {
        if (voucher.discountType === "PERCENTAGE") {
            return `${voucher.discount}% off (max ${formatPrice(
                parseInt(voucher.maxDiscountAmount)
            )})`;
        }
        return `${formatPrice(voucher.discount)} off`;
    };

    const isVoucherSaved = (voucherId: string) => {
        return savedVoucherIds.includes(voucherId);
    };

    const getVoucherQuantity = (voucherId: string) => {
        return savedVoucherQuantities[voucherId] || 1;
    };

    const getDisplayVouchers = () => {
        if (activeTab === "saved") {
            return vouchers.filter((v) => savedVoucherIds.includes(v.id));
        }
        return vouchers;
    };

    const switchTab = (tab: "all" | "saved") => {
        setActiveTab(tab);
        Animated.spring(slideAnim, {
            toValue: tab === "all" ? 0 : 1,
            useNativeDriver: true,
        }).start();
    };

    const renderVoucherCard = (voucher: Voucher) => {
        const isSaved = isVoucherSaved(voucher.id);
        const isSaving = savingVoucherId === voucher.id;
        const quantity = getVoucherQuantity(voucher.id);

        return (
            <View key={voucher.id} style={styles.voucherCard}>
                {/* Left side - Discount badge */}
                <View style={styles.voucherLeft}>
                    <View style={[
                        styles.discountBadge,
                        voucher.discountType === "PERCENTAGE"
                            ? styles.percentageBadge
                            : styles.fixedBadge
                    ]}>
                        <Ionicons name="pricetag" size={20} color="#fff" />
                        <Text style={styles.discountBadgeText}>
                            {voucher.discountType === "PERCENTAGE"
                                ? `${voucher.discount}%`
                                : formatPrice(voucher.discount)}
                        </Text>
                    </View>
                </View>

                {/* Dotted line separator */}
                <View style={styles.dashedSeparator}>
                    <View style={styles.topCircle} />
                    {[...Array(8)].map((_, i) => (
                        <View key={i} style={styles.dashedDot} />
                    ))}
                    <View style={styles.bottomCircle} />
                </View>

                {/* Right side - Voucher info */}
                <View style={styles.voucherRight}>
                    <View style={styles.voucherHeader}>
                        <Text style={styles.voucherCode}>{voucher.code}</Text>
                        <TouchableOpacity
                            onPress={() => handleCopyCode(voucher.code)}
                            style={styles.copyBtn}
                        >
                            <Ionicons name="copy-outline" size={16} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.discountText}>{getDiscountText(voucher)}</Text>

                    <View style={styles.voucherMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="cart-outline" size={14} color="#94A3B8" />
                            <Text style={styles.metaText}>
                                Min. order: {formatPrice(voucher.minOrderAmount)}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                            <Text style={styles.metaText}>
                                Expires: {formatDate(voucher.expiryDate)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.voucherDescription} numberOfLines={2}>
                        {voucher.description}
                    </Text>

                    {/* Action Buttons Row */}
                    <View style={styles.buttonRow}>
                        {/* Save/Saved Button */}
                        {isSaved ? (
                            <View style={[styles.actionButton, styles.savedButton]}>
                                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                <Text style={styles.savedButtonText}>
                                    Saved {quantity > 1 ? `(x${quantity})` : ''}
                                </Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={() => handleSaveVoucher(voucher)}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#5B9EE1" />
                                ) : (
                                    <>
                                        <Ionicons name="bookmark-outline" size={16} color="#5B9EE1" />
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Apply Button - Only show if voucher is saved */}
                        {isSaved && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.applyButton]}
                                onPress={() => handleApplyVoucher(voucher)}
                            >
                                <Ionicons name="cart" size={16} color="#FFFFFF" />
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B9EE1" />
                <Text style={styles.loadingText}>Loading vouchers...</Text>
            </View>
        );
    }

    const displayVouchers = getDisplayVouchers();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vouchers</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "all" && styles.activeTab]}
                    onPress={() => switchTab("all")}
                >
                    <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
                        All Vouchers
                    </Text>
                    <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeText}>{vouchers.length}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "saved" && styles.activeTab]}
                    onPress={() => switchTab("saved")}
                >
                    <Text style={[styles.tabText, activeTab === "saved" && styles.activeTabText]}>
                        My Vouchers
                    </Text>
                    <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeText}>{savedVoucherIds.length}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={18} color="#5B9EE1" />
                <Text style={styles.infoBannerText}>
                    Tap "Save" to save voucher to your collection
                </Text>
            </View>

            {/* Voucher List */}
            <ScrollView
                style={styles.voucherList}
                contentContainerStyle={styles.voucherListContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#5B9EE1"]}
                        tintColor="#5B9EE1"
                    />
                }
            >
                {displayVouchers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="ticket-outline" size={48} color="#CBD5E1" />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {activeTab === "saved"
                                ? "No saved vouchers yet"
                                : "No vouchers available"}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {activeTab === "saved"
                                ? "Save vouchers to use at checkout"
                                : "Check back later for new vouchers"}
                        </Text>
                    </View>
                ) : (
                    displayVouchers.map(renderVoucherCard)
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0F4F8",
        paddingTop: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F4F8",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#64748B",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    tabContainer: {
        flexDirection: "row",
        marginHorizontal: 16,
        backgroundColor: "#E2E8F0",
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    activeTab: {
        backgroundColor: "#5B9EE1",
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 3,
    },
    activeTabText: {
        color: "#FFFFFF",
    },
    tabBadge: {
        backgroundColor: "rgba(255,255,255,0.3)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    infoBanner: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginTop: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: "#EFF6FF",
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#5B9EE1",
        gap: 8,
    },
    infoBannerText: {
        fontSize: 13,
        color: "#475569",
        flex: 1,
    },
    voucherList: {
        flex: 1,
        marginTop: 16,
    },
    voucherListContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    voucherCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        overflow: "hidden",
    },
    voucherLeft: {
        width: 90,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
    },
    discountBadge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    percentageBadge: {
        backgroundColor: "#5B9EE1",
    },
    fixedBadge: {
        backgroundColor: "#10B981",
    },
    discountBadgeText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    dashedSeparator: {
        width: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    topCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#F0F4F8",
        marginTop: -8,
    },
    bottomCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#F0F4F8",
        marginBottom: -8,
    },
    dashedDot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#CBD5E1",
    },
    voucherRight: {
        flex: 1,
        padding: 16,
    },
    voucherHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    voucherCode: {
        fontSize: 18,
        fontWeight: "800",
        color: "#0F172A",
        letterSpacing: 0.5,
    },
    copyBtn: {
        padding: 4,
    },
    discountText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#5B9EE1",
        marginBottom: 10,
    },
    voucherMeta: {
        gap: 4,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        color: "#94A3B8",
    },
    voucherDescription: {
        fontSize: 12,
        color: "#64748B",
        marginBottom: 12,
        lineHeight: 18,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    saveButton: {
        borderWidth: 1.5,
        borderColor: "#5B9EE1",
        backgroundColor: "transparent",
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#5B9EE1",
    },
    savedButton: {
        backgroundColor: "#10B981",
        borderWidth: 0,
    },
    savedButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    applyButton: {
        backgroundColor: "#5B9EE1",
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    applyButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#94A3B8",
        textAlign: "center",
        paddingHorizontal: 40,
    },
});
