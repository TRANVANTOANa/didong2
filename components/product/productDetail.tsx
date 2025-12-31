// app/product/productDetail.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HomeHeader from "../../components/home/HomeHeader";
import { useCart } from "../../context/CartContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Định nghĩa type cho Product
type ProductDetail = {
  tag: string;
  name: string;
  priceBig: number;
  priceBottom: number;
  description: string;
  mainImage: any;
  gallery: any[];
  category: string;
};

// Dữ liệu đầy đủ cho TẤT CẢ sản phẩm
const PRODUCTS: Record<string, ProductDetail> = {
  "1": {
    tag: "BEST SELLER",
    name: "Nike Air Jordan Blue",
    priceBig: "$567.800",
    priceBottom: "$493.00",
    description:
      "Air Jordan is an American brand of basketball shoes, athletic, casual, and style clothing produced by Nike. The silhouette of Michael Jordan served as inspiration to create a shoe that offers ultimate comfort and performance on the court.",
    mainImage: require("../../assets/images/home/sp1.png"),
    gallery: [
      require("../../assets/images/home/sp1.png"),
      require("../../assets/images/home/sp2.png"),
      require("../../assets/images/home/sp3_bestchoi.png"),
    ],
    category: "Nike",
  },
  "2": {
    tag: "BEST SELLER",
    name: "Nike Air Max Red",
    priceBig: "$459.000",
    priceBottom: "$399.00",
    description:
      "Nike Air Max is a line of shoes produced by Nike, Inc., with the first model released in 1987. Air Max shoes are identified by their midsole air cushioning pockets that are visible from the side of the sole.",
    mainImage: require("../../assets/images/home/sp2.png"),
    gallery: [
      require("../../assets/images/home/sp2.png"),
      require("../../assets/images/home/sp1.png"),
      require("../../assets/images/home/sp3.png"),
    ],
    category: "Nike",
  },
  "3": {
    tag: "TRENDING",
    name: "Nike Runner Orange",
    priceBig: "$499.000",
    priceBottom: "$429.00",
    description:
      "Nike Runner Orange is designed for the modern runner. With responsive cushioning and a sleek design, these shoes offer both style and performance for your daily runs.",
    mainImage: require("../../assets/images/home/sp3.png"),
    gallery: [
      require("../../assets/images/home/sp3.png"),
      require("../../assets/images/home/sp1.png"),
      require("../../assets/images/home/sp2.png"),
    ],
    category: "Nike",
  },
  "4": {
    tag: "BEST CHOICE",
    name: "Nike Air Jordan 2022",
    priceBig: "$967.800",
    priceBottom: "$849.69",
    description:
      "The Nike Air Jordan 2022 Edition brings a fresh take on the classic silhouette. Premium materials and cutting-edge technology ensure maximum comfort and style for any occasion.",
    mainImage: require("../../assets/images/home/sp3_bestchoi.png"),
    gallery: [
      require("../../assets/images/home/sp3_bestchoi.png"),
      require("../../assets/images/home/sp1.png"),
      require("../../assets/images/home/sp2.png"),
    ],
    category: "Nike",
  },
  "5": {
    tag: "NEW",
    name: "Nike Zoom Purple",
    priceBig: "$599.000",
    priceBottom: "$520.00",
    description:
      "Nike Zoom Purple features Nike's revolutionary Zoom Air technology for responsive cushioning. Perfect for athletes who demand the best performance from their footwear.",
    mainImage: require("../../assets/images/home/sp4.png"),
    gallery: [
      require("../../assets/images/home/sp4.png"),
      require("../../assets/images/home/sp1.png"),
      require("../../assets/images/home/sp3.png"),
    ],
    category: "Nike",
  },
  "6": {
    tag: "NEW",
    name: "Puma Speed White",
    priceBig: "$359.000",
    priceBottom: "$310.00",
    description:
      "Puma Speed White combines lightweight construction with superior comfort. These shoes are perfect for both casual wear and light athletic activities.",
    mainImage: require("../../assets/images/home/sp5.jpg"),
    gallery: [
      require("../../assets/images/home/sp5.jpg"),
      require("../../assets/images/home/sp8.jpg"),
      require("../../assets/images/home/sp1.png"),
    ],
    category: "Puma",
  },
  "7": {
    tag: "NEW",
    name: "Puma Classic White",
    priceBig: "$339.000",
    priceBottom: "$289.00",
    description:
      "Puma Classic White is a timeless design that never goes out of style. With premium leather upper and comfortable cushioning, these shoes are perfect for everyday wear.",
    mainImage: require("../../assets/images/home/sp8.jpg"),
    gallery: [
      require("../../assets/images/home/sp8.jpg"),
      require("../../assets/images/home/sp5.jpg"),
      require("../../assets/images/home/sp1.png"),
    ],
    category: "Puma",
  },
};

const SIZES = [38, 39, 40, 41, 42, 43];

// Chuyển "$849.69" -> 849.69
const parsePrice = (priceStr: string) => {
  return Number(priceStr.replace("$", ""));
};

// Xác định màu tag
const getTagColor = (tag: string) => {
  switch (tag) {
    case "BEST SELLER":
      return "#5B9EE1";
    case "BEST CHOICE":
      return "#F59E0B";
    case "HOT":
      return "#EF4444";
    case "NEW":
      return "#10B981";
    case "TRENDING":
      return "#8B5CF6";
    default:
      return "#60A5FA";
  }
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addToCart } = useCart();

  // Lấy sản phẩm theo id
  const productId = id || "1";
  const product = PRODUCTS[productId];

  const [selectedSize, setSelectedSize] = useState<number>(40);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Xử lý trường hợp sản phẩm không tồn tại
  if (!product) {
    return (
      <SafeAreaView style={styles.screen}>
        <HomeHeader />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#CBD5E1" />
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backButtonError}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonErrorText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Giữ nguyên HomeHeader */}
      <HomeHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button & Title Row */}
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Product Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Image Card */}
        <View style={styles.imageCard}>
          <Text style={styles.categoryLabel}>{product.category} Shoes</Text>

          <View style={styles.imageWrapper}>
            <Image
              source={product.gallery[selectedImageIndex]}
              style={styles.mainImage}
            />
          </View>

          {/* Gallery Thumbnails */}
          <View style={styles.thumbnailRow}>
            {product.gallery.map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnailItem,
                  selectedImageIndex === index && styles.thumbnailItemActive,
                ]}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image source={img} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          {/* Tag Badge */}
          <View
            style={[
              styles.tagBadge,
              { backgroundColor: getTagColor(product.tag) },
            ]}
          >
            <Text style={styles.tagText}>{product.tag}</Text>
          </View>

          {/* Name & Price Row */}
          <View style={styles.namePriceRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.priceBottom}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Size Section */}
          <View style={styles.sizeHeader}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.sizeTypeRow}>
              <Text style={styles.sizeTypeActive}>EU</Text>
              <Text style={styles.sizeType}>US</Text>
              <Text style={styles.sizeType}>UK</Text>
            </View>
          </View>

          <View style={styles.sizeRow}>
            {SIZES.map((size) => {
              const isActive = size === selectedSize;
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeItem, isActive && styles.sizeItemActive]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[styles.sizeText, isActive && styles.sizeTextActive]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Bottom: Price & Add to Cart */}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalPrice}>{product.priceBottom}</Text>
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => {
                addToCart({
                  id: productId,
                  name: product.name,
                  price: parsePrice(product.priceBottom),
                  image: product.mainImage,
                  size: selectedSize.toString(),
                });
                router.push("/cart");
              }}
            >
              <Ionicons
                name="bag-add-outline"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.addToCartText}>Add To Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  // Title Row
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
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
  pageTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
  },
  // Image Card
  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#5B9EE1",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 8,
  },
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
  },
  mainImage: {
    width: SCREEN_WIDTH - 96,
    height: 180,
    resizeMode: "contain",
  },
  // Thumbnails
  thumbnailRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    gap: 10,
  },
  thumbnailItem: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailItemActive: {
    borderColor: "#5B9EE1",
    backgroundColor: "#EBF4FF",
  },
  thumbnailImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  // Info Card
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tagBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  namePriceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B9EE1",
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  // Size
  sizeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  sizeTypeRow: {
    flexDirection: "row",
    gap: 10,
  },
  sizeType: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  sizeTypeActive: {
    fontSize: 11,
    color: "#5B9EE1",
    fontWeight: "600",
  },
  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sizeItem: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  sizeItemActive: {
    backgroundColor: "#5B9EE1",
    borderColor: "#5B9EE1",
  },
  sizeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  sizeTextActive: {
    color: "#FFFFFF",
  },
  // Bottom
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#5B9EE1",
    shadowColor: "#5B9EE1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonError: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#5B9EE1",
  },
  backButtonErrorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
