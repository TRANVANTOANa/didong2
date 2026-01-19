import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, doc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase/firebaseConfig";

// Voucher data matching the Lucky Spin rewards
const vouchersToAdd = [
    {
        code: "SALE10",
        description: "Giảm 10% cho đơn hàng của bạn",
        discount: 10,
        discountType: "PERCENTAGE",
        minOrderAmount: 50,
        maxDiscountAmount: "20",
        usageLimit: 100,
        usedCount: 0,
        voucherType: "DISCOUNT",
        isActive: true,
    },
    {
        code: "FREESHIP",
        description: "Miễn phí vận chuyển cho đơn hàng",
        discount: 100,
        discountType: "PERCENTAGE",
        minOrderAmount: 30,
        maxDiscountAmount: "15",
        usageLimit: 200,
        usedCount: 0,
        voucherType: "SHIPPING",
        isActive: true,
    },
    {
        code: "WELCOME15",
        description: "Chào mừng! Giảm 15% cho đơn đầu tiên",
        discount: 15,
        discountType: "PERCENTAGE",
        minOrderAmount: 40,
        maxDiscountAmount: "30",
        usageLimit: 500,
        usedCount: 0,
        voucherType: "WELCOME",
        isActive: true,
    },
    {
        code: "VIP100",
        description: "Giảm $100 cho khách hàng VIP",
        discount: 100,
        discountType: "FIXED",
        minOrderAmount: 300,
        maxDiscountAmount: "100",
        usageLimit: 50,
        usedCount: 0,
        voucherType: "VIP",
        isActive: true,
    },
    {
        code: "FLASH20",
        description: "Flash Sale! Giảm 20% - Chỉ hôm nay",
        discount: 20,
        discountType: "PERCENTAGE",
        minOrderAmount: 60,
        maxDiscountAmount: "40",
        usageLimit: 100,
        usedCount: 0,
        voucherType: "FLASH_SALE",
        isActive: true,
    },
    {
        code: "MEMBER25",
        description: "Ưu đãi thành viên - Giảm 25%",
        discount: 25,
        discountType: "PERCENTAGE",
        minOrderAmount: 80,
        maxDiscountAmount: "50",
        usageLimit: 150,
        usedCount: 0,
        voucherType: "MEMBER",
        isActive: true,
    },
    {
        code: "BIRTHDAY",
        description: "Chúc mừng sinh nhật! Giảm 30%",
        discount: 30,
        discountType: "PERCENTAGE",
        minOrderAmount: 50,
        maxDiscountAmount: "60",
        usageLimit: 100,
        usedCount: 0,
        voucherType: "BIRTHDAY",
        isActive: true,
    },
    {
        code: "SUPER30",
        description: "Siêu giảm giá 30% cho đơn hàng lớn",
        discount: 30,
        discountType: "PERCENTAGE",
        minOrderAmount: 100,
        maxDiscountAmount: "80",
        usageLimit: 80,
        usedCount: 0,
        voucherType: "SUPER_SALE",
        isActive: true,
    },
];

export default function SeedVouchersScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<string[]>([]);

    const checkExistingVoucher = async (code: string): Promise<boolean> => {
        const q = query(collection(db, "vouchers"), where("code", "==", code));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    };

    const seedVouchers = async () => {
        setLoading(true);
        setResults([]);
        const logs: string[] = [];

        // Set expiry date to 6 months from now
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);

        for (const voucher of vouchersToAdd) {
            try {
                // Check if voucher already exists
                const exists = await checkExistingVoucher(voucher.code);
                if (exists) {
                    logs.push(`⚠️ ${voucher.code} already exists`);
                    continue;
                }

                const voucherRef = doc(collection(db, "vouchers"));
                await setDoc(voucherRef, {
                    ...voucher,
                    expiryDate: Timestamp.fromDate(expiryDate),
                    createdAt: Timestamp.now(),
                });
                logs.push(`✅ Added: ${voucher.code}`);
            } catch (error) {
                logs.push(`❌ Error: ${voucher.code}`);
                console.error(error);
            }
            setResults([...logs]);
        }

        setLoading(false);
        Alert.alert("Hoàn tất", "Đã thêm vouchers vào Firebase!");
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Seed Vouchers</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>🎫 Thêm Vouchers vào Firebase</Text>
                <Text style={styles.subtitle}>
                    Nhấn nút bên dưới để thêm tất cả vouchers cho Lucky Spin vào Firestore
                </Text>

                <View style={styles.voucherList}>
                    {vouchersToAdd.map((v, i) => (
                        <View key={i} style={styles.voucherItem}>
                            <Text style={styles.voucherCode}>{v.code}</Text>
                            <Text style={styles.voucherDesc}>{v.description}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.seedBtn, loading && styles.seedBtnDisabled]}
                    onPress={seedVouchers}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.seedBtnText}>🚀 Thêm Vouchers</Text>
                    )}
                </TouchableOpacity>

                {results.length > 0 && (
                    <View style={styles.resultsBox}>
                        <Text style={styles.resultsTitle}>Kết quả:</Text>
                        {results.map((r, i) => (
                            <Text key={i} style={styles.resultItem}>{r}</Text>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 55,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 20,
    },
    voucherList: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        maxHeight: 300,
    },
    voucherItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    voucherCode: {
        fontSize: 16,
        fontWeight: "700",
        color: "#6366F1",
    },
    voucherDesc: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 2,
    },
    seedBtn: {
        backgroundColor: "#6366F1",
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: "center",
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    seedBtnDisabled: {
        opacity: 0.6,
    },
    seedBtnText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
    },
    resultsBox: {
        marginTop: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 10,
    },
    resultItem: {
        fontSize: 14,
        color: "#475569",
        paddingVertical: 4,
    },
});
