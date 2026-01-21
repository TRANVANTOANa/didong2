// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "../context/CartContext";
import { ChatProvider } from "../context/ChatContext";
import { FavoriteProvider } from "../context/FavoriteContext";
import { NotificationProvider } from "../context/NotificationContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NotificationProvider>
          <CartProvider>
            <FavoriteProvider>
              <ChatProvider>
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
              </ChatProvider>
            </FavoriteProvider>
          </CartProvider>
        </NotificationProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
