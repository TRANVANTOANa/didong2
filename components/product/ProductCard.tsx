// components/ProductCard.tsx
import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

type Props = {
  tag: string;
  name: string;
  price: string;
  image: any;
  style?: ViewStyle;
  onPress?: () => void; // 👉 thêm để card bấm được
};

export default function ProductCard({
  tag,
  name,
  price,
  image,
  style,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <Image source={image} style={styles.productImage} />

      <Text style={styles.tag}>{tag}</Text>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.row}>
        <Text style={styles.price}>{price}</Text>
        <TouchableOpacity style={styles.plusButton}>
          <Text style={{ color: "#FFFFFF", fontSize: 20 }}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 170,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 90,
    resizeMode: "contain",
  },
  tag: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "600",
    color: "#60A5FA",
  },
  name: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  row: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
});
