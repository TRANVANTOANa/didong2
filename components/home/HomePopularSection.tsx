// components/home/HomePopularSection.tsx
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ProductCard from "../product/ProductCard";

export default function HomePopularSection() {
    const router = useRouter();

    return (
        <View>
            {/* Section header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Shoes</Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>

            {/* Horizontal scrollable product list */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Product 1 */}
                <ProductCard
                    id="1"
                    tag="BEST SELLER"
                    name="Nike Jordan"
                    price="$493.00"
                    image={require("../../assets/images/home/sp1.png")}
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname: "/product/productDetail",
                            params: { id: "1" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Nike Jordan");
                    }}
                />

                {/* Product 2 */}
                <ProductCard
                    id="2"
                    tag="BEST SELLER"
                    name="Nike Air Max"
                    price="$399.00"
                    image={require("../../assets/images/home/sp2.png")}
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname: "/product/productDetail",
                            params: { id: "2" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Nike Air Max");
                    }}
                />

                {/* Product 3 */}
                <ProductCard
                    id="3"
                    tag="HOT"
                    name="Nike Runner"
                    price="$429.00"
                    image={require("../../assets/images/home/sp3.png")}
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname: "/product/productDetail",
                            params: { id: "3" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Nike Runner");
                    }}
                />

                {/* Product 4 */}
                <ProductCard
                    id="4"
                    tag="HOT"
                    name="Puma Classic"
                    price="$359.00"
                    image={require("../../assets/images/home/sppuma.jpg")}
                    onPress={() =>
                        router.push({
                            pathname: "/product/productDetail",
                            params: { id: "4" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Puma Classic");
                    }}
                />
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
