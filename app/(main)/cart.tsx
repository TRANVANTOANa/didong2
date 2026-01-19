// app/(main)/cart.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/CartContext";
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
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{items.length}</Text>
        </View>
      </View>

      {/* Chỉ còn phần Shopping Cart nằm trong ScrollView */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: items.length > 0 ? 200 : 24, // chừa chỗ cho Order Summary
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-outline" size={18} color="#5B9EE1" />
            <Text style={styles.cardHeaderText}>Shopping Cart</Text>
          </View>

          {/* Cart Items List */}
          {items.map((item) => (
            <View
              key={`${item.id}-${item.size}`}
              style={styles.cartRow}
            >
              <View style={styles.itemImageContainer}>
                <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemSize}>Size: {item.size}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

                {/* Quantity Controls */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => changeQty(item.id, item.size, -1)}
                  >
                    <Ionicons name="remove" size={16} color="#64748B" />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.qty}</Text>
                  <TouchableOpacity
                    style={[styles.qtyButton, styles.qtyButtonActive]}
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
              <Ionicons name="cart-outline" size={64} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add some products to your cart
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push("/products")}
              >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Voucher Card */}
        {items.length > 0 && (
          <View style={[styles.card, styles.voucherCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="pricetag-outline" size={18} color="#10B981" />
              <Text style={styles.cardHeaderText}>Apply Voucher</Text>
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
                      : `$${selectedVoucher.discount.toFixed(2)}`} discount applied
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
                style={styles.selectVoucherBtn}
                onPress={() => router.push("/account/vouchers")}
              >
                <View style={styles.selectVoucherContent}>
                  <Ionicons name="ticket-outline" size={20} color="#5B9EE1" />
                  <Text style={styles.selectVoucherText}>Select a voucher</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Order Summary cố định dưới đáy màn hình */}
      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.summaryCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="receipt-outline" size={18} color="#5B9EE1" />
              <Text style={styles.cardHeaderText}>Order Summary</Text>
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
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
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 12,
  },
  cartBadge: {
    backgroundColor: "#5B9EE1",
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
    backgroundColor: "#FFFFFF",
    padding: 16,
    shadowColor: "#5B9EE1",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    color: "#0F172A",
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
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
    color: "#0F172A",
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5B9EE1",
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
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonActive: {
    backgroundColor: "#5B9EE1",
  },
  qtyValue: {
    marginHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
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
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  shopButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#5B9EE1",
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
    bottom: 24, // có thể chỉnh lại cho hợp với tab bar / safe area
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
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 14,
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B9EE1",
  },
  checkoutButton: {
    flexDirection: "row",
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: "#5B9EE1",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    shadowColor: "#5B9EE1",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#5B9EE1",
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
    color: "#5B9EE1",
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
