// app/(home)/cart.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useCart } from "../../context/CartContext";

export default function CartScreen() {
  const router = useRouter();
  const { items, changeQty, removeItem } = useCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping = items.length > 0 ? 40.99 : 0;
  const total = subtotal + shipping;

  return (
    <View style={styles.screen}>
      {/* Tiêu đề */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 18 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Thân */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Top title trong card */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>My Cart</Text>
          </View>

          {/* Danh sách item */}
          {items.map((item) => (
            <View
              key={`${item.id}-${item.size}`}
              style={styles.cartRow}
            >
              <Image source={item.image} style={styles.itemImage} />

              <View style={{ flex: 1 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSize}>Size {item.size}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${item.price.toFixed(2)}
                </Text>

                {/* nút +/- */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => changeQty(item.id, item.size, -1)}
                  >
                    <Text style={styles.qtyButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => changeQty(item.id, item.size, +1)}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* nút delete */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeItem(item.id, item.size)}
              >
                <Text style={{ color: "#EF4444", fontSize: 18 }}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Nếu giỏ trống */}
          {items.length === 0 && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 16,
                color: "#6B7280",
              }}
            >
              Your cart is empty.
            </Text>
          )}

          {/* Tính tiền */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shopping</Text>
              <Text style={styles.summaryValue}>
                ${shipping.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>
                Total Cost
              </Text>
              <Text style={[styles.summaryValue, { fontWeight: "700" }]}>
                ${total.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                items.length === 0 && { opacity: 0.5 },
              ]}
              disabled={items.length === 0}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FB",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  cardHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
    resizeMode: "contain",
    marginRight: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  itemSize: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  qtyValue: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  deleteButton: {
    marginLeft: 8,
  },
  summaryBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
  },
  checkoutButton: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: "#5B9EE1",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
