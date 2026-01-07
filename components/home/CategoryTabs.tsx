// components/CategoryTabs.tsx
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";

const brands = [
  { id: "nike", image: require("../../assets/images/home/nike.png") },
  { id: "adidas", image: require("../../assets/images/home/adidas.png") },
  { id: "puma", image: require("../../assets/images/home/puma.png") },
  { id: "under_armour", image: require("../../assets/images/home/under_armour.png") },
  { id: "converse", image: require("../../assets/images/home/converse.png") },
];

const CategoryTabs = () => {
  const [active, setActive] = useState("nike");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 16 }}
    >
      {brands.map((item) => {
        const isActive = item.id === active;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => setActive(item.id)}
          >
            <Image source={item.image} style={styles.brandImage} resizeMode="contain" />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default CategoryTabs;

const styles = StyleSheet.create({
  pill: {
    width: 70,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  pillActive: {
    backgroundColor: "#2563EB",
  },
  brandImage: {
    width: 28,
    height: 28,
  },
});
