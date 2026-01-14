// components/chat/ChatProductCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Product } from "../../lib/gemini";

type ChatProductCardProps = {
    product: Product;
};

export default function ChatProductCard({ product }: ChatProductCardProps) {
    const router = useRouter();

    const formatPrice = (price: string | number) => {
        let numPrice = 0;
        if (typeof price === 'string') {
            // Loại bỏ tất cả ký tự không phải số và dấu chấm
            numPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
        } else {
            numPrice = price;
        }
        // Format USD - nếu là số nguyên thì không hiển thị .00
        if (numPrice % 1 === 0) {
            return numPrice.toString();
        }
        return numPrice.toFixed(2);
    };

    const handlePress = () => {
        router.push(`/product/${product.id}` as any);
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Image
                source={
                    product.imageUrl
                        ? { uri: product.imageUrl }
                        : require('../../assets/images/home/sp1.png') // Fallback image
                }
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Text style={styles.brand}>{product.brand}</Text>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.price}>${formatPrice(product.price)}</Text>
                    <View style={styles.arrowButton}>
                        <Ionicons name="arrow-forward" size={16} color="#5B9EE1" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: 90,
        height: 90,
        backgroundColor: "#F8FAFC",
    },
    content: {
        flex: 1,
        padding: 10,
        justifyContent: "space-between",
    },
    brand: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    name: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0F172A",
        marginTop: 2,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },
    price: {
        fontSize: 15,
        fontWeight: "700",
        color: "#5B9EE1",
    },
    arrowButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#EBF4FF",
        alignItems: "center",
        justifyContent: "center",
    },
});
