// components/product/FavoriteProductsSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    FlatList,
    ListRenderItem,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { FavoriteItem, useFavorite } from "../../context/FavoriteContext";
import ProductCard from "./ProductCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;
const GAP = 12;

export default function FavoriteProductsSection() {
    const router = useRouter();
    const { favorites, removeFromFavorite } = useFavorite();

    const renderItem: ListRenderItem<FavoriteItem> = ({ item, index }) => {
        const isLeftItem = index % 2 === 0;
        return (
            <View style={[styles.cardWrapper, isLeftItem ? styles.cardLeft : styles.cardRight]}>
                <ProductCard
                    id={item.id}
                    tag={item.tag}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    onPress={() =>
                        router.push({
                            pathname: "/product/productDetail",
                            params: { id: item.id },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add to cart from favorites:", item.name);
                    }}
                />
            </View>
        );
    };

    // Empty State Component
    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
                <Ionicons name="heart-outline" size={64} color="#E2E8F0" />
            </View>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptySubtitle}>
                Tap the heart icon on any product to add it to your favorites
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push("/products")}
            >
                <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Favorites</Text>
                {favorites.length > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{favorites.length}</Text>
                    </View>
                )}
            </View>

            {/* Product List or Empty State */}
            {favorites.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F172A",
    },
    countBadge: {
        marginLeft: 10,
        backgroundColor: "#5B9EE1",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    // List
    listContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: 100,
    },
    cardWrapper: {
        marginBottom: 12,
    },
    cardLeft: {
        marginRight: GAP / 2,
    },
    cardRight: {
        marginLeft: GAP / 2,
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    emptyIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    browseButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: "#5B9EE1",
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    browseButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
