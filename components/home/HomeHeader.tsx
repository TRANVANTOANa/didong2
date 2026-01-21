// components/home/HomeHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useCart } from "../../context/CartContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";

type HomeHeaderProps = {
  onMenuPress?: () => void;
};

export default function HomeHeader({ onMenuPress }: HomeHeaderProps) {
  const router = useRouter();
  const { items } = useCart();
  const { colors, isDarkMode } = useTheme();
  const { unreadCount } = useNotifications();
  const cartItemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Menu button */}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.card }]}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <Ionicons name="menu-outline" size={22} color={colors.icon} />
      </TouchableOpacity>

      {/* Location */}
      <TouchableOpacity style={styles.locationContainer} activeOpacity={0.8}>
        <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="location" size={14} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.storeLabel, { color: colors.textMuted }]}>Store location</Text>
          <View style={styles.storeNameRow}>
            <Text style={[styles.storeName, { color: colors.text }]}>Mondolibug, Sylhet</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Right Icons */}
      <View style={styles.rightIcons}>
        {/* Notifications */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={() => router.push("/account/notifications")}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.icon} />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Wishlist */}
        <TouchableOpacity
          style={[styles.iconButton, styles.marginLeft, { backgroundColor: colors.card }]}
          onPress={() => router.push("/(main)/favorite")}
          activeOpacity={0.7}
        >
          <Ionicons name="heart-outline" size={22} color={colors.icon} />
        </TouchableOpacity>

        {/* Cart with badge */}
        <TouchableOpacity
          style={[styles.iconButton, styles.marginLeft, { backgroundColor: colors.card }]}
          onPress={() => router.push("/(main)/cart")}
          activeOpacity={0.7}
        >
          <Ionicons name="bag-outline" size={22} color={colors.icon} />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  },
  marginLeft: {
    marginLeft: 10,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#F59E0B",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  locationContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  storeLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  storeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storeName: {
    fontSize: 13,
    fontWeight: "600",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
});
