import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import ProductCard from "./ProductCard";

// Tính toán khoảng cách
const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;
const GAP = 12;

// Type Product
export type Product = {
    id: string;
    tag: string;
    name: string;
    price: string;
    category: string;
    imageUrl: string; // Changed from 'image: any' to 'imageUrl: string'
};




// Danh sách category
const CATEGORIES = ["All", "Nike", "Puma", "Adidas"];

export default function ProductList() {
    const router = useRouter();
    const params = useLocalSearchParams<{ search?: string }>();

    // State quản lý
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
    const [searchKeyword, setSearchKeyword] = useState(params.search || "");

    // Dữ liệu sản phẩm sẽ được lấy từ Firestore
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Fetch products from Firebase
        import("../../firebase/products").then(({ fetchProducts }) => {
            fetchProducts()
                .then((data) => {
                    // Debug: Log first product to check imageUrl
                    if (data.length > 0) {
                        console.log("Sample product data:", JSON.stringify(data[0], null, 2));
                        console.log("All imageUrls:", data.map(p => ({ id: p.id, imageUrl: p.imageUrl })));
                    }
                    setProducts(data);
                })
                .catch((error) => {
                    console.error("Error fetching products:", error);
                })
                .finally(() => setLoading(false));
        });
    }, []);

    // Logic lọc & sắp xếp
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Lọc theo Keyword search
        if (searchKeyword.trim()) {
            const keyword = searchKeyword.toLowerCase().trim();
            result = result.filter(
                (item) =>
                    item.name.toLowerCase().includes(keyword) ||
                    item.category.toLowerCase().includes(keyword) ||
                    item.tag.toLowerCase().includes(keyword)
            );
        }

        // Lọc theo Category
        if (activeCategory !== "All") {
            result = result.filter((item) => item.category === activeCategory);
        }

        // Sắp xếp theo Giá
        if (sortOrder) {
            result.sort((a, b) => {
                const priceA = parseFloat(String(a.price).replace("$", ""));
                const priceB = parseFloat(String(b.price).replace("$", ""));
                return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
            });
        }

        return result;
    }, [activeCategory, sortOrder, searchKeyword, products]);

    // Clear search
    const handleClearSearch = () => {
        setSearchKeyword("");
    };

    // Toggle sắp xếp
    const toggleSort = () => {
        if (sortOrder === null) setSortOrder("asc");
        else if (sortOrder === "asc") setSortOrder("desc");
        else setSortOrder(null);
    };

    // Render từng item
    const renderItem: ListRenderItem<Product> = ({ item, index }) => {
        const isLeftItem = index % 2 === 0;
        return (
            <View style={[styles.cardWrapper, isLeftItem ? styles.cardLeft : styles.cardRight]}>
                <ProductCard
                    id={item.id}
                    tag={item.tag}
                    name={item.name}
                    price={item.price}
                    image={{ uri: item.imageUrl }} // Changed to imageUrl
                    onPress={() =>
                        router.push({
                            pathname: "/product/[id]",
                            params: { id: item.id },
                        })
                    }
                    onAddPress={() => {
                        console.log(`Add ${item.name}`);
                    }}
                />
            </View>
        );
    };

    return (
        loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B9EE1" />
            </View>
        ) : (
            <View style={styles.container}>
                {/* Header Title */}
                <View style={styles.headerSection}>
                    <Text style={styles.title}>
                        {searchKeyword ? `Search: "${searchKeyword}"` : "All Products"}
                    </Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={18} color="#5B9EE1" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name, category..."
                            placeholderTextColor="#9CA3AF"
                            value={searchKeyword}
                            onChangeText={setSearchKeyword}
                            returnKeyType="search"
                        />
                        {searchKeyword.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch}>
                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View >

                {/* Filter Section */}
                < View style={styles.filterWrapper} >
                    {/* Category Tabs */}
                    < ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryContainer}
                    >
                        {
                            CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryBtn,
                                        activeCategory === cat && styles.categoryBtnActive,
                                    ]}
                                    onPress={() => setActiveCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            activeCategory === cat && styles.categoryTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView >

                    {/* Sort Bar */}
                    < View style={styles.sortBar} >
                        <Text style={styles.resultText}>
                            Found {filteredProducts.length} items
                        </Text>

                        <TouchableOpacity style={styles.sortBtn} onPress={toggleSort}>
                            <Text style={styles.sortBtnText}>
                                Sort:{" "}
                                {sortOrder === "asc"
                                    ? "Low to High"
                                    : sortOrder === "desc"
                                        ? "High to Low"
                                        : "Default"}
                            </Text>
                            <Ionicons
                                name={
                                    sortOrder === "asc"
                                        ? "arrow-up"
                                        : sortOrder === "desc"
                                            ? "arrow-down"
                                            : "filter"
                                }
                                size={14}
                                color="#5B9EE1"
                            />
                        </TouchableOpacity>
                    </View >
                </View >

                {/* Product Grid */}
                < FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id
                    }
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        < View style={styles.emptyView} >
                            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No products found.</Text>
                        </View >
                    }
                />
            </View>
        )
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    // Header
    headerSection: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 16,
        paddingBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F172A",
        letterSpacing: -0.3,
    },
    // Search
    searchContainer: {
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: 12,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#0F172A",
    },
    // Filter
    filterWrapper: {
        backgroundColor: "#F8FAFC",
        marginBottom: 8,
    },
    categoryContainer: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: 12,
        gap: 8,
    },
    categoryBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    categoryBtnActive: {
        backgroundColor: "#5B9EE1",
        borderColor: "#5B9EE1",
    },
    categoryText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
    },
    categoryTextActive: {
        color: "#FFFFFF",
    },
    // Sort
    sortBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: HORIZONTAL_PADDING,
        marginBottom: 8,
    },
    resultText: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
    sortBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    sortBtnText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#5B9EE1",
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
    // Empty
    emptyView: {
        alignItems: "center",
        marginTop: 60,
        gap: 10,
    },
    emptyText: {
        fontSize: 16,
        color: "#94A3B8",
    },
});