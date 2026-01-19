// components/home/HomePopularSection.tsx
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebase/firebaseConfig";
import ProductCard from "../product/ProductCard";

interface HomePopularSectionProps {
    selectedCategory?: string;
}

export default function HomePopularSection({ selectedCategory }: HomePopularSectionProps) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let productsQuery;

            if (selectedCategory) {
                // Filter by category
                productsQuery = query(
                    collection(db, "products"),
                    where("category", "==", selectedCategory)
                );
            } else {
                // Fetch all if no category (though we default to Nike usually)
                productsQuery = query(collection(db, "products"));
            }

            const snapshot = await getDocs(productsQuery);
            const productList: any[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Client-side filtering for "Popular" logic if needed, 
                // but for now let's show all items in this category or relevant ones.
                // The user wants "Popular Shoes". Maybe just show all for the category?
                // The original static data had specific items. 
                // Let's filter client-side for "BEST SELLER" or "HOT" if we want to be strict,
                // OR just show all items of the selected brand to make it look populated.

                // Let's include everything for the brand to ensure we have data to show.
                productList.push({ id: doc.id, ...data });
            });
            setProducts(productList);
        } catch (error) {
            console.error("Error fetching popular products:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="small" color="#5B9EE1" style={{ marginTop: 20 }} />;
    }

    if (products.length === 0) {
        return (
            <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: "#64748B" }}>No products found for {selectedCategory}</Text>
            </View>
        );
    }

    return (
        <View>
            {/* Section header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {selectedCategory ? `${selectedCategory} Shoes` : "Popular Shoes"}
                </Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>

            {/* Horizontal scrollable product list */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {products.map((item) => (
                    <ProductCard
                        key={item.id}
                        id={item.id}
                        tag={item.tag || "HOT"}
                        name={item.name}
                        price={item.price.toString().startsWith("$") ? item.price : `$${item.price}`}
                        image={typeof item.image === "string" ? { uri: item.image } : item.image}
                        style={styles.card}
                        onPress={() =>
                            router.push({
                                pathname: "/product/[id]",
                                params: { id: item.id },
                            })
                        }
                        onAddPress={() => {
                            const priceVal = typeof item.price === "string"
                                ? parseFloat(item.price.replace('$', '').replace(/,/g, ''))
                                : item.price;

                            addToCart({
                                id: item.id,
                                name: item.name,
                                price: isNaN(priceVal) ? 0 : priceVal,
                                image: typeof item.image === "string" ? { uri: item.image } : item.image,
                                imageUrl: typeof item.image === "string" ? item.image : undefined,
                                size: "41", // Default size for quick add
                            });
                            Alert.alert("Success", "Added to cart!");
                        }}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 4,
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
        marginTop: 16,
    },
    scrollContent: {
        paddingLeft: 4,
        paddingRight: 16,
    },
    card: {
        marginRight: 16,
    },
});
