// components/home/HomeNewArrivalSection.tsx
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebase/firebaseConfig";
import NewArrivalCard from "./NewArrivalCard";

interface HomeNewArrivalSectionProps {
    selectedCategory?: string;
}

export default function HomeNewArrivalSection({ selectedCategory }: HomeNewArrivalSectionProps) {
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
                productsQuery = query(
                    collection(db, "products"),
                    where("category", "==", selectedCategory)
                );
            } else {
                productsQuery = query(collection(db, "products"));
            }

            const snapshot = await getDocs(productsQuery);
            const productList: any[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Filter for NEW items or just show them if they match criteria
                // For demonstration, let's include items that have "NEW" or show all if few.
                // Or just show different subset.
                productList.push({ id: doc.id, ...data });
            });

            // For New Arrival, maybe we reverse to show latest added (if we assume added sequentially)
            // or filter by tag "NEW"
            const newArrivals = productList.filter(p => p.tag === "NEW" || p.tag === "BEST CHOICE");

            // If no specific NEW items, just show the list
            setProducts(newArrivals.length > 0 ? newArrivals : productList);

        } catch (error) {
            console.error("Error fetching new arrivals:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="small" color="#5B9EE1" style={{ marginTop: 20 }} />;
    }

    if (products.length === 0) {
        return null; // Hide section if no new arrivals
    }

    return (
        <View>
            {/* Section header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New Arrivals</Text>
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
                    <NewArrivalCard
                        key={item.id}
                        id={item.id}
                        tag={item.tag || "NEW"}
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
        marginTop: 28,
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
