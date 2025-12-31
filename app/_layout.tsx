// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "../context/CartContext";
import { FavoriteProvider } from "../context/FavoriteContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* CartProvider và FavoriteProvider bọc toàn bộ Stack */}
      <CartProvider>
        <FavoriteProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Màn khởi động / redirect */}
            <Stack.Screen name="index" />

            {/* Onboarding */}
            <Stack.Screen name="onboarding/onboarding1" />
            <Stack.Screen name="onboarding/onboarding2" />
            <Stack.Screen name="onboarding/onboarding3" />

            {/* Auth screens */}
            <Stack.Screen name="(auth)" />

            {/* Nhóm màn main dùng tabs */}
            <Stack.Screen name="(main)" />
          </Stack>
        </FavoriteProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
