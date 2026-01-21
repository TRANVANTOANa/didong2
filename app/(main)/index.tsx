// app/(main)/index.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import CategoryTabs from "../../components/home/CategoryTabs";
import FloatingLuckySpin from "../../components/home/FloatingLuckySpin";
import HomeBanner from "../../components/home/HomeBanner";
import HomeHeader from "../../components/home/HomeHeader";
import HomeNewArrivalSection from "../../components/home/HomeNewArrivalSection";
import HomePopularSection from "../../components/home/HomePopularSection";
import HomeVoucherSection from "../../components/home/HomeVoucherSection";
import DrawerMenu from "../../components/ui/DrawerMenu";
import SearchBar from "../../components/ui/SearchBar";
import { useTheme } from "../../context/ThemeContext";

import ProductList from "../../components/product/ProductList";

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Nike");
  const [searchQuery, setSearchQuery] = useState("");
  const { colors } = useTheme();

  // Tự động đóng drawer khi màn hình mất focus (chuyển trang)
  useFocusEffect(
    useCallback(() => {
      return () => {
        setDrawerVisible(false);
      };
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with menu button */}
      <HomeHeader onMenuPress={() => setDrawerVisible(true)} />

      {/* Persistent Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <SearchBar
          onSearch={setSearchQuery}
          initialValue={searchQuery}
          placeholder="Search for shoes..."
        />
      </View>

      {searchQuery ? (
        /* Search Results View */
        <View style={{ flex: 1 }}>
          <ProductList initialSearch={searchQuery} showHeader={false} />
        </View>
      ) : (
        /* Normal Home Content */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Hero Banner */}
          <HomeBanner />

          {/* Voucher Section */}
          <HomeVoucherSection />

          {/* Category Tabs */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Popular / Best Sellers */}
          <HomePopularSection selectedCategory={selectedCategory} />

          {/* New Arrivals */}
          <HomeNewArrivalSection selectedCategory={selectedCategory} />
        </ScrollView>
      )}

      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Floating Lucky Spin Widget */}
      <FloatingLuckySpin />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
});
