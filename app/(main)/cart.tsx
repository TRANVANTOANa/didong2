  // app/(main)/cart.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import storage from "../../utils/storage";

interface AppliedVoucher {
  code: string;
  discount: number;
  discountType: "PERCENTAGE" | "FIXED";
  maxDiscountAmount?: string;
}

export default function CartScreen() {
  const router = useRouter();
  const { items, changeQty, removeItem } = useCart();
  const { colors, isDarkMode } = useTheme();
  const [selectedVoucher, setSelectedVoucher] = useState<AppliedVoucher | null>(null);

  // Load voucher from AsyncStorage when screen loads
  useFocusEffect(
    React.useCallback(() => {
      loadSavedVoucher();
    }, [])
  );

  const loadSavedVoucher = async () => {
    try {
      const savedVoucher = await storage.getItem("selectedVoucher");
      if (savedVoucher) {
        setSelectedVoucher(JSON.parse(savedVoucher));
      }
    } catch (error) {
      console.error("Error loading voucher:", error);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = items.length > 0 ? 40.99 : 0;

  // Calculate discount
  let discount = 0;
  if (selectedVoucher) {
    if (selectedVoucher.discountType === "PERCENTAGE") {
      discount = (subtotal * selectedVoucher.discount) / 100;
      if (selectedVoucher.maxDiscountAmount) {
        const maxDiscount = parseFloat(selectedVoucher.maxDiscountAmount);
        discount = Math.min(discount, maxDiscount);
      }
    } else {
      discount = selectedVoucher.discount;
    }
  }

  const total = subtotal + shipping - discount;

  const handleCheckout = () => {
    router.push("/product/checkout");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cart</Text>
        <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.cartBadgeText}>{items.length}</Text>
        </View>
      </View>

      {/* Shopping Cart ScrollView */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: items.length > 0 ? 200 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Items Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardHeaderText, { color: colors.text }]}>Products</Text>
          </View>

          {/* Cart Items List */}
          {items.map((item) => (
            <View
              key={`${item.id}-${item.size}`}
              style={[styles.cartRow, { borderBottomColor: colors.divider }]}
            >
              <View style={[styles.itemImageContainer, { backgroundColor: colors.inputBackground }]}>
                <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.itemSize, { color: colors.textMuted }]}>Size: {item.size}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>${item.price.toFixed(2)}</Text>

                {/* Quantity Controls */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={[styles.qtyButton, { backgroundColor: colors.inputBackground }]}
                    onPress={() => changeQty(item.id, item.size, -1)}
                  >
                    <Ionicons name="remove" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyValue, { color: colors.text }]}>{item.qty}</Text>
                  <TouchableOpacity
                    style={[styles.qtyButton, { backgroundColor: colors.primary }]}
                    onPress={() => changeQty(item.id, item.size, +1)}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeItem(item.id, item.size)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Empty Cart State */}
          {items.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Add items to your cart to checkout
              </Text>
              <TouchableOpacity
                style={[styles.shopButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/products")}
              >
                <Text style={styles.shopButtonText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Voucher Card */}
        {items.length > 0 && (
          <View style={[styles.card, styles.voucherCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="pricetag-outline" size={18} color="#10B981" />
              <Text style={[styles.cardHeaderText, { color: colors.text }]}>Voucher</Text>
            </View>

            {selectedVoucher ? (
              <View style={styles.appliedVoucherContainer}>
                <View style={styles.appliedVoucherInfo}>
                  <View style={styles.voucherCodeBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.voucherCodeText}>{selectedVoucher.code}</Text>
                  </View>
                  <Text style={styles.voucherDiscountText}>
                    -{selectedVoucher.discountType === "PERCENTAGE"
                      ? `${selectedVoucher.discount}%`
                      : `$${selectedVoucher.discount.toFixed(2)}`} applied
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeVoucherBtn}
                  onPress={() => setSelectedVoucher(null)}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.selectVoucherBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => router.push("/account/vouchers")}
              >
                <View style={styles.selectVoucherContent}>
                  <Ionicons name="ticket-outline" size={20} color={colors.primary} />
                  <Text style={[styles.selectVoucherText, { color: colors.primary }]}>Select Voucher</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Order Summary */}
      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.summaryCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              <Text style={[styles.cardHeaderText, { color: colors.text }]}>Order Summary</Text>
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping Fee</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${shipping.toFixed(2)}
                </Text>
              </View>
              {selectedVoucher && discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.discountLabel]}>
                    Discount ({selectedVoucher.code})
                  </Text>
                  <Text style={[styles.summaryValue, styles.discountValue]}>
                    -${discount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
              onPress={handleCheckout}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  scroll: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },
  cartBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    marginHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  shopButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Summary
  summaryContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
  summaryCard: {
    marginTop: 0,
  },
  summaryBox: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  checkoutButton: {
    flexDirection: "row",
    marginTop: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Voucher Styles
  voucherCard: {
    marginTop: 16,
  },
  selectVoucherBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  selectVoucherContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectVoucherText: {
    fontSize: 15,
    fontWeight: "600",
  },
  appliedVoucherContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#10B981",
    padding: 14,
  },
  appliedVoucherInfo: {
    flex: 1,
  },
  voucherCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  voucherCodeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  voucherDiscountText: {
    fontSize: 13,
    color: "#059669",
  },
  removeVoucherBtn: {
    padding: 4,
  },
  discountLabel: {
    color: "#10B981",
    fontWeight: "600",
  },
  discountValue: {
    color: "#10B981",
    fontWeight: "700",
  },
});
