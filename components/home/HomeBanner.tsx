// components/HomeBanner.tsx
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomeBanner = () => {
  return (
    <View style={styles.container}>
      {/* Text bên trái */}
      <View style={{ flex: 1 }}>
        <Text style={styles.smallText}>Just do it with</Text>
        <Text style={styles.title}>Nike</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Hình giày bên phải */}
      <Image
        source={require("../../assets/images/home/bannergiay1.png")}
        style={styles.shoeImage}
      />
    </View>
  );
};

export default HomeBanner;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#1F2937", // nền tối
    flexDirection: "row",
    alignItems: "center",
  },
  smallText: {
    fontSize: 12,
    color: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    alignSelf: "flex-start",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  shoeImage: {
    width: 110,
    height: 80,
    resizeMode: "contain",
    marginLeft: 8,
  },
});
