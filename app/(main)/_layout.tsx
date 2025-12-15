import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5B9EE1",
        tabBarInactiveTintColor: "#B8C5D0",
        tabBarStyle: {
          height: 60,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E8ECEF",
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 0,
          display: "none",
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="home-outline"
                size={26}
                color={focused ? "#5B9EE1" : "#B8C5D0"}
              />
            </View>
          ),
        }}
      />

      {/* Products */}
      <Tabs.Screen
        name="products"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="bag-handle-outline"
                size={26}
                color={focused ? "#5B9EE1" : "#B8C5D0"}
              />
            </View>
          ),
        }}
      />

      {/* Cart - Center with special styling */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "",
          tabBarIcon: () => (
            <View style={styles.centerIconWrapper}>
              <View style={styles.centerIconShadow1} />
              <View style={styles.centerIconShadow2} />
              <View style={styles.centerIconCircle}>
                <Ionicons name="bag-outline" size={24} color="#FFFFFF" />
              </View>
            </View>
          ),
        }}
      />

      {/* Favorite */}
      <Tabs.Screen
        name="favorite"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="heart-outline"
                size={26}
                color={focused ? "#5B9EE1" : "#B8C5D0"}
              />
            </View>
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="person-outline"
                size={26}
                color={focused ? "#5B9EE1" : "#B8C5D0"}
              />
            </View>
          ),
        }}
      />

      {/* ===== Hidden Screens (không hiện icon trên tab bar) ===== */}

      <Tabs.Screen
        name="about"
        options={{
          href: null,
        }}
      />

     <Tabs.Screen
        name="productDetail"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />      


      {/* Nếu cần màn chi tiết riêng cho favorite */}
      <Tabs.Screen
        name="favoriteDetail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
  },
  centerIconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
  },
  centerIconShadow1: {
    position: "absolute",
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "#5B9EE1",
    opacity: 0.12,
    top: 5,
  },
  centerIconShadow2: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#5B9EE1",
    opacity: 0.2,
    top: 2,
  },
  centerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5B9EE1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B9EE1",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
