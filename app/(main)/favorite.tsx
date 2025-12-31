// app/(main)/favorite.tsx
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import HomeHeader from "../../components/home/HomeHeader";
import FavoriteProductsSection from "../../components/product/FavoriteProductsSection";

export default function FavoriteScreen() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Giữ nguyên HomeHeader */}
            <HomeHeader />

            {/* Danh sách sản phẩm yêu thích */}
            <FavoriteProductsSection />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
});
