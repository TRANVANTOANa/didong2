// app/(main)/favorite.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import HomeHeader from "../../components/home/HomeHeader";
import FavoriteProductsSection from "../../components/product/FavoriteProductsSection";
import DrawerMenu from "../../components/ui/DrawerMenu";

export default function FavoriteScreen() {
    const [drawerVisible, setDrawerVisible] = useState(false);

    // Tự động đóng drawer khi màn hình mất focus (chuyển trang)
    useFocusEffect(
        useCallback(() => {
            // Khi màn hình được focus thì không làm gì
            return () => {
                // Khi màn hình mất focus thì đóng drawer
                setDrawerVisible(false);
            };
        }, [])
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                {/* Header với menu button */}
                <HomeHeader onMenuPress={() => setDrawerVisible(true)} />

                {/* Danh sách sản phẩm yêu thích */}
                <FavoriteProductsSection />
            </SafeAreaView>

            {/* Drawer Menu */}
            <DrawerMenu
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
});
