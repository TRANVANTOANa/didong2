// app/(main)/favorite.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import HomeHeader from "../../components/home/HomeHeader";
import FavoriteProductsSection from "../../components/product/FavoriteProductsSection";
import DrawerMenu from "../../components/ui/DrawerMenu";
import { useTheme } from "../../context/ThemeContext";

export default function FavoriteScreen() {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { colors } = useTheme();

    // Tự động đóng drawer khi màn hình mất focus (chuyển trang)
    useFocusEffect(
        useCallback(() => {
            return () => {
                setDrawerVisible(false);
            };
        }, [])
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
    },
});
