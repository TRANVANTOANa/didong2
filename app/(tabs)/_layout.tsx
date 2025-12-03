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
          display: 'none',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        headerShown: false,
      }}
    >
      
      {/* Home */}
      <Tabs.Screen
        name="``  `                                                                                                                                                                                                                                                                                           ``"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
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

      {/* Favorite */}
      <Tabs.Screen
        name="favorite"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
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

      {/* Cart - Center with special styling */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerIconWrapper}>
              <View style={styles.centerIconShadow1} />
              <View style={styles.centerIconShadow2} />
              <View style={styles.centerIconCircle}>
                <Ionicons
                  name="bag-outline"
                  size={24}
                  color="#FFFFFF"
                />
              </View>
            </View>
          ),
        }}
      />

      {/* Notification */}
      <Tabs.Screen
        name="notification"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="notifications-outline"
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
          tabBarIcon: ({ color, focused }) => (
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

      {/* Hidden Screens */}
      <Tabs.Screen
        name="about"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="product"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="register"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tabs
  initialRouteName="login"   // mở login trước
  screenOptions={{
    headerShown: false,
    tabBarStyle: { display: 'none' }, // ẩn tab bar cho login
  }}
>
  <Tabs.Screen
    name="login"
    options={{
      href: null,
      tabBarStyle: { display: 'none' },
    }}
  />
  {/* Các tab khác */}
</Tabs>

      <Tabs.Screen
        name="forgot-password"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
  },
  centerIconShadow1: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#5B9EE1',
    opacity: 0.15,
    top: 3,
  },
  centerIconShadow2: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#5B9EE1',
    opacity: 0.25,
    top: 0,
  },
  centerIconCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#5B9EE1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#5B9EE1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});