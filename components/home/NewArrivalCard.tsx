// components/NewArrivalCard.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  tag: string;
  name: string;
  price: string;
  image: any;
};

export default function NewArrivalCard({ tag, name, price, image }: Props) {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.tag}>{tag}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>

      <Image source={image} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  tag: {
    fontSize: 11,
    color: "#60A5FA",
    fontWeight: "600",
  },
  name: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  price: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  image: {
    width: 120,
    height: 80,
    resizeMode: "contain",
  },
});
