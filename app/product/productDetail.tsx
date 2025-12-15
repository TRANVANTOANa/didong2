// app/(home)/productDetail.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
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

// dữ liệu demo cho 2 sản phẩm
const PRODUCTS = {
  "1": {
    tag: "BEST SELLER",
    name: "Nike Air Jordan",
    priceBig: "$967.800",
    priceBottom: "$849.69",
    description:
      "Air Jordan is an American brand of basketball shoes athletic, casual, and style clothing produced by Nike...",
    mainImage: require("../../assets/images/home/sp1.png"),
    gallery: [
      require("../../assets/images/home/sp1.png"),
      require("../../assets/images/home/sp2.png"),
      require("../../assets/images/home/sp3_bestchoi.png"),
    ],
  },
  "2": {
    tag: "BEST SELLER",
    name: "Nike Air Max",
    priceBig: "$899.000",
    priceBottom: "$799.00",
    description:
      "Nike Air Max is a line of shoes produced by Nike, offering lightweight cushioning and stylish design...",
    mainImage: require("../../assets/images/home/sp2.png"),
    gallery: [
      require("../../assets/images/home/sp2.png"),
      require("../../assets/images/home/sp1.png"),
      require("../../assets/images/home/sp3_bestchoi.png"),
    ],
  },
};

const SIZES = [38, 39, 40, 41, 42, 43];

// chuyển "$849.69" -> 849.69
const parsePrice = (priceStr: string) => {
  return Number(priceStr.replace("$", ""));
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addToCart } = useCart();

  // nếu không có id thì dùng sản phẩm 1
  const product = PRODUCTS[id || "1"];
  const [selectedSize, setSelectedSize] = useState<number>(40);

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Details</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* top: back + title + cart */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => router.back()}
            >
              <Text style={{ fontSize: 16 }}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.topTitle}>Men&apos;s Shoes</Text>

            <TouchableOpacity style={styles.circleButton}>
              <Image
                source={require("../../assets/images/home/Group 123.png")}
                style={{ width: 18, height: 18, resizeMode: "contain" }}
              />
            </TouchableOpacity>
          </View>

          {/* hình chính */}
          <View style={styles.imageWrapper}>
            <Image source={product.mainImage} style={styles.mainImage} />
            {/* thanh slider giả */}
            <View style={styles.sliderBase}>
              <View style={styles.sliderDot} />
            </View>
          </View>

          {/* block info màu trắng bên dưới */}
          <View style={styles.infoContainer}>
            <Text style={styles.tag}>{product.tag}</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.priceBig}>{product.priceBig}</Text>
            </View>

            <Text style={styles.description}>{product.description}</Text>

            {/* Gallery */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
              Gallery
            </Text>
            <View style={styles.galleryRow}>
              {product.gallery.map((img, index) => (
                <View key={index} style={styles.galleryItem}>
                  <Image source={img} style={styles.galleryImage} />
                </View>
              ))}
            </View>

            {/* Size */}
            <View style={styles.rowBetween}>
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Size</Text>
              <Text style={{ marginTop: 16, fontSize: 12, color: "#9CA3AF" }}>
                EU   US   UK
              </Text>
            </View>

            <View style={styles.sizeRow}>
              {SIZES.map((size) => {
                const active = size === selectedSize;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeItem,
                      active && styles.sizeItemActive,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        active && styles.sizeTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Price + Add to cart */}
            <View style={[styles.rowBetween, { marginTop: 20 }]}>
              <View>
                <Text style={styles.sectionLabel}>Price</Text>
                <Text style={styles.priceBottom}>{product.priceBottom}</Text>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  // thêm vào giỏ hàng
                  addToCart({
                    id: id || "1",
                    name: product.name,
                    price: parsePrice(product.priceBottom),
                    image: product.mainImage,
                    size: selectedSize.toString(),
                  });
                  // chuyển sang màn Cart
                  router.push("/cart");
                }}
              >
                <Text style={styles.addButtonText}>Add To Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 16,
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  imageWrapper: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#F9FBFF",
    borderRadius: 20,
  },
  mainImage: {
    width: 240,
    height: 160,
    resizeMode: "contain",
  },
  sliderBase: {
    marginTop: 20,
    width: 180,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
  },
  infoContainer: {
    marginTop: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  tag: {
    fontSize: 12,
    fontWeight: "700",
    color: "#60A5FA",
    letterSpacing: 0.8,
  },
  productName: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  priceBig: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3B82F6",
  },
  description: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 20,
  },
  galleryRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  galleryItem: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  galleryImage: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  sizeRow: {
    flexDirection: "row",
    marginTop: 14,
    flexWrap: "wrap",
    gap: 10,
  },
  sizeItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  sizeItemActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  sizeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },
  sizeTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceBottom: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  addButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
