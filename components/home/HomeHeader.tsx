// components/HomeHeader.tsx
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      {/* nút menu bên trái */}
      <TouchableOpacity style={styles.circleButton}>
        <Text style={{ fontSize: 18 }}>☰</Text>
      </TouchableOpacity>

      {/* vị trí store */}
      <View style={styles.locationContainer}>
        <Text style={styles.storeLabel}>Store location</Text>
        <Text style={styles.storeName}>Mondolibug, Sylhet</Text>
      </View>

      {/* icon phải */}
      <View style={styles.rightIcons}>
        <TouchableOpacity style={styles.circleButton}>
          <Image
            source={require("../../assets/images/home/Group.png")} // icon tim
            style={styles.iconImage}
          />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.circleButton, { marginLeft: 8 }]}>
          <Image
            source={require("../../assets/images/home/Icon.png")} // icon chuông
            style={styles.iconImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F6FB",
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  locationContainer: {
    flex: 1,
    alignItems: "center",
  },
  storeLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  storeName: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  rightIcons: {
    flexDirection: "row",
  },
  iconImage: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
});
