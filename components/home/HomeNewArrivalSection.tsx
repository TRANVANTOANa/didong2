// components/home/HomeNewArrivalSection.tsx
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import NewArrivalCard from "./NewArrivalCard";

export default function HomeNewArrivalSection() {
    const router = useRouter();

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
                {/* Product 1 */}
                <NewArrivalCard
                    id="4"
                    tag="BEST CHOICE"
                    name="Nike Air Jordan"
                    price="$849.69"
                    image={require("../../assets/images/home/sp3_bestchoi.png")}
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname: "/product/[id]",
                            params: { id: "1" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Nike Air Jordan");
                    }}
                />

                {/* Product 2 */}
                <NewArrivalCard
                    id="5"
                    tag="NEW"
                    name="Nike Spike 1"
                    price="$759.00"
                    image={require("../../assets/images/home/spnike1.jpg")}
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname: "/product/[id]",
                            params: { id: "2" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Nike Spike 1");
                    }}
                />

                {/* Product 3 */}
                <NewArrivalCard
                    id="6"
                    tag="NEW"
                    name="Nike Spike 2"
                    price="$799.00"
                    image={require("../../assets/images/home/spnike2.jpg")}
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname: "/product/[id]",
                            params: { id: "3" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Nike Spike 2");
                    }}
                />

                {/* Product 4 */}
                <NewArrivalCard
                    id="7"
                    tag="HOT"
                    name="Nike Spike 3"
                    price="$829.00"
                    image={require("../../assets/images/home/spnike3.jpg")}
                    onPress={() =>
                        router.push({
                            pathname: "/product/[id]",
                            params: { id: "4" },
                        })
                    }
                    onAddPress={() => {
                        console.log("Add Nike Spike 3");
                    }}
                />
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
