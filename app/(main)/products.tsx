// app/(main)/products.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import HomeHeader from "../../components/home/HomeHeader";
import ProductList from "../../components/product/ProductList";
import DrawerMenu from "../../components/ui/DrawerMenu";
import { useTheme } from "../../context/ThemeContext";

export default function ProductListScreen() {
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* Header với menu button */}
        <HomeHeader onMenuPress={() => setDrawerVisible(true)} />

        {/* Nội dung trang Products */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <ProductList />
        </View>
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});