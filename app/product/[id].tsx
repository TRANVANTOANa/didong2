// app/product/productDetail.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ProductCard from "../../components/product/ProductCard";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { ProductReview, fetchProductReviews } from "../../firebase/orders";
import { Product } from "../../firebase/products";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SIZES = [38, 39, 40, 41, 42, 43];

const parsePrice = (priceStr: string) => {
  return Number(priceStr.replace("$", ""));
};

const getTagStyle = (tag: string) => {
  const styles: Record<string, { bg: string; text: string }> = {
    "BEST SELLER": { bg: "#FF6B6B", text: "#FFFFFF" },
    "BEST CHOICE": { bg: "#4ECDC4", text: "#FFFFFF" },
    "HOT": { bg: "#FF8C42", text: "#FFFFFF" },
    "NEW": { bg: "#95E1D3", text: "#1A535C" },
    "TRENDING": { bg: "#A78BFA", text: "#FFFFFF" },
  };
  return styles[tag] || { bg: "#6366F1", text: "#FFFFFF" };
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addToCart } = useCart();
  const { colors, isDarkMode } = useTheme();

  const productId = id || "1";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number>(40);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    import("../../firebase/products").then(({ fetchProductById, fetchProducts }) => {
      fetchProductById(productId)
        .then((data) => {
          setProduct(data);
          if (data) {
            fetchProducts().then((allProducts) => {
              const related = allProducts
                .filter((p) => p.category === data.category && p.id !== data.id)
                .slice(0, 4);
              setRelatedProducts(related);
            });
          }
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [productId]);

  useEffect(() => {
    setLoadingReviews(true);
    fetchProductReviews(productId)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, [productId]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const gallery = product?.gallery?.length
    ? product.gallery
    : product?.imageUrl
      ? [product.imageUrl]
      : [];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: productId,
      name: product.name,
      price: parsePrice(product.price),
      image: { uri: gallery[0] },
      imageUrl: gallery[0] || product.imageUrl,
      size: selectedSize.toString(),
    });
    router.push("/cart");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#000" />
        </View>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="cube-outline" size={80} color="#DDD" />
        <Text style={styles.errorTitle}>Không tìm thấy sản phẩm</Text>
        <Text style={styles.errorSubtitle}>Sản phẩm này không tồn tại hoặc đã bị xóa</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tagStyle = getTagStyle(product.tag);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="share-social-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          {/* Main Image */}
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: gallery[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="contain"
            />
            {/* Tag Badge */}
            <View style={[styles.tagBadge, { backgroundColor: tagStyle.bg }]}>
              <Text style={[styles.tagText, { color: tagStyle.text }]}>{product.tag}</Text>
            </View>
            {/* Favorite Button */}
            <TouchableOpacity style={styles.favoriteBtn}>
              <Ionicons name="heart-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Thumbnail Gallery */}
          {gallery.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {gallery.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnailItem,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbnailImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Image Indicator */}
          <View style={styles.imageIndicator}>
            {gallery.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  selectedImageIndex === index && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          {/* Category */}
          <Text style={styles.categoryText}>{product.category}</Text>

          {/* Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(averageRating) ? "star" : "star-outline"}
                  size={16}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({reviews.length} đánh giá)</Text>
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>Đã bán 1.2k</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{product.price}</Text>
            <Text style={styles.originalPrice}>$999.99</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-15%</Text>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.quickInfoText}>Chính hãng</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="car" size={20} color="#3B82F6" />
              <Text style={styles.quickInfoText}>Miễn phí ship</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <Ionicons name="refresh" size={20} color="#F59E0B" />
              <Text style={styles.quickInfoText}>Đổi trả 30 ngày</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Size Selection */}
        <View style={styles.sizeSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kích cỡ</Text>
            <TouchableOpacity>
              <Text style={styles.sizeGuideText}>Hướng dẫn chọn size</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sizeGrid}>
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeBtn,
                  selectedSize === size && styles.sizeBtnActive,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeBtnText,
                    selectedSize === size && styles.sizeBtnTextActive,
                  ]}
                >
                  EU {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descText}>{product.description}</Text>
          <TouchableOpacity style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Xem thêm</Text>
            <Ionicons name="chevron-down" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Reviews */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá ({reviews.length})</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.ratingLeft}>
              <Text style={styles.bigRating}>{averageRating.toFixed(1)}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(averageRating) ? "star" : "star-outline"}
                    size={14}
                    color="#FFB800"
                  />
                ))}
              </View>
              <Text style={styles.totalReviews}>{reviews.length} đánh giá</Text>
            </View>
            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <View key={rating} style={styles.ratingBarRow}>
                    <Text style={styles.ratingLabel}>{rating}</Text>
                    <Ionicons name="star" size={10} color="#FFB800" />
                    <View style={styles.ratingBarBg}>
                      <View
                        style={[styles.ratingBarFill, { width: `${percentage}%` }]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Review List */}
          {loadingReviews ? (
            <ActivityIndicator size="small" color="#000" style={{ marginVertical: 20 }} />
          ) : reviews.length === 0 ? (
            <View style={styles.noReviews}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#DDD" />
              <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
            </View>
          ) : (
            <View style={styles.reviewList}>
              {reviews.slice(0, 2).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.avatarText}>
                        {review.userEmail?.[0]?.toUpperCase() || "U"}
                      </Text>
                    </View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>
                        {review.userEmail?.split("@")[0] || "Người dùng"}
                      </Text>
                      <View style={styles.reviewMeta}>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= review.rating ? "star" : "star-outline"}
                              size={12}
                              color="#FFB800"
                            />
                          ))}
                        </View>
                        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.verifiedText}>Đã mua</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  tag={item.tag}
                  name={item.name}
                  price={item.price}
                  image={{ uri: item.imageUrl }}
                  style={styles.relatedCard}
                  onPress={() =>
                    router.push({
                      pathname: "/product/[id]",
                      params: { id: item.id },
                    })
                  }
                  onAddPress={() => {
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: parsePrice(item.price),
                      image: { uri: item.imageUrl },
                      imageUrl: item.imageUrl,
                      size: "41",
                    });
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomLeft}>
          <TouchableOpacity style={styles.bottomIconBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#666" />
            <Text style={styles.bottomIconLabel}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomIconBtn}>
            <Ionicons name="cart-outline" size={22} color="#666" />
            <Text style={styles.bottomIconLabel}>Giỏ hàng</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRight}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={() => {
              handleAddToCart();
            }}
          >
            <Text style={styles.buyNowText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  errorButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  scrollView: {
    flex: 1,
  },

  // Image Section
  imageSection: {
    backgroundColor: "#F8F8F8",
    paddingBottom: 20,
  },
  mainImageContainer: {
    position: "relative",
    alignItems: "center",
    paddingVertical: 30,
  },
  mainImage: {
    width: SCREEN_WIDTH - 60,
    height: 280,
  },
  tagBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  favoriteBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  thumbnailScroll: {
    marginHorizontal: 20,
  },
  thumbnailContainer: {
    gap: 12,
  },
  thumbnailItem: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: "#000",
  },
  thumbnailImage: {
    width: 48,
    height: 48,
  },
  imageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DDD",
  },
  indicatorDotActive: {
    backgroundColor: "#000",
    width: 20,
  },

  // Info Section
  infoSection: {
    padding: 20,
  },
  categoryText: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    lineHeight: 28,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 13,
    color: "#999",
  },
  soldBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldText: {
    fontSize: 12,
    color: "#666",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FF4757",
  },
  originalPrice: {
    fontSize: 16,
    color: "#BBB",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#FFE5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF4757",
  },
  quickInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
  },
  quickInfoItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickInfoText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  quickInfoDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E5E5",
  },

  // Divider
  sectionDivider: {
    height: 8,
    backgroundColor: "#F5F5F5",
  },

  // Size Section
  sizeSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  sizeGuideText: {
    fontSize: 13,
    color: "#3B82F6",
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFF",
  },
  sizeBtnActive: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  sizeBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  sizeBtnTextActive: {
    color: "#FFF",
  },

  // Description
  descSection: {
    padding: 20,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
    marginTop: 12,
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  readMoreText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500",
  },

  // Reviews
  reviewsSection: {
    padding: 20,
  },
  seeAllText: {
    fontSize: 13,
    color: "#3B82F6",
  },
  ratingSummary: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  ratingLeft: {
    alignItems: "center",
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: "#FEE2B3",
  },
  bigRating: {
    fontSize: 40,
    fontWeight: "800",
    color: "#F59E0B",
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 2,
  },
  totalReviews: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 4,
  },
  ratingBars: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: "center",
    gap: 6,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingLabel: {
    fontSize: 11,
    color: "#92400E",
    width: 8,
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#FEF3C7",
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 3,
  },
  noReviews: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
  reviewList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 10,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 1,
  },
  reviewDate: {
    fontSize: 11,
    color: "#999",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8FFF3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10B981",
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    color: "#444",
  },

  // Related Products
  relatedSection: {
    padding: 20,
  },
  relatedScroll: {
    gap: 12,
    paddingRight: 20,
  },
  relatedCard: {
    width: (SCREEN_WIDTH - 60) / 2,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomLeft: {
    flexDirection: "row",
    gap: 16,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: "#F0F0F0",
  },
  bottomIconBtn: {
    alignItems: "center",
    gap: 2,
  },
  bottomIconLabel: {
    fontSize: 10,
    color: "#666",
  },
  bottomRight: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    paddingLeft: 16,
  },
  addToCartBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  buyNowBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#FF4757",
    justifyContent: "center",
    alignItems: "center",
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
});
