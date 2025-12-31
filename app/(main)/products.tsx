// app/(main)/products.tsx
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import HomeHeader from "../../components/home/HomeHeader";
import ProductList from "../../components/product/ProductList";

export default function ProductListScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header giống trang Home */}
      <HomeHeader />

      {/* Nội dung trang Products */}
      <View style={styles.container}>
        <ProductList />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});