// app/(home)/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import CategoryTabs from "../../components/home/CategoryTabs";
import HomeBanner from "../../components/home/HomeBanner";
import HomeHeader from "../../components/home/HomeHeader";
import NewArrivalCard from "../../components/home/NewArrivalCard";
import ProductCard from "../../components/product/ProductCard";
import SearchBar from "../../components/ui/SearchBar";

export default function HomeScreen() {
  const router = useRouter(); // dùng để điều hướng

  return (
    <View style={styles.container}>
      <HomeHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ô tìm kiếm */}
        <SearchBar />

        {/* Banner Nike */}
        <HomeBanner />

        {/* Tabs thương hiệu */}
        <CategoryTabs />

        {/* Popular Shoes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Shoes</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
        >
          <ProductCard
            tag="BEST SELLER"
            name="Nike Jordan"
            price="$493.00"
            image={require("../../assets/images/home/sp1.png")}
            style={{ marginRight: 16 }}
            onPress={() =>
              router.push({ pathname: "/product/productDetail", params: { id: "1" } })
            } // xem chi tiết sản phẩm 1
          />

          <ProductCard
            tag="BEST SELLER"
            name="Nike Air Max"
            price="$399.00"
            image={require("../../assets/images/home/sp2.png")}
            onPress={() =>
              router.push({ pathname: "/product/productDetail", params: { id: "2" } })
            } // xem chi tiết sản phẩm 2
          />
        </ScrollView>

        {/* New Arrivals */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
        </View>

        <NewArrivalCard
          tag="BEST CHOICE"
          name="Nike Air Jordan"
          price="$849.69"
          image={require("../../assets/images/home/sp3_bestchoi.png")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  sectionHeader: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
});
