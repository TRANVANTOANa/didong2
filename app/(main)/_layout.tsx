import { Tabs } from "expo-router";
import { AnimatedTabBar } from "../../components/ui/AnimatedTabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      {/* AI Chat - Thay thế Products */}
      <Tabs.Screen name="aichat" options={{ title: "AI Chat" }} />

      {/* Cart - Center with special styling */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
        }}
      />

      {/* Favorite */}
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Favorite",
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />


    </Tabs>
  );
}
