// app/(main)/products.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    ListRenderItem,
    StyleSheet,
    Text,
    View,
} from "react-native";

import ProductCard from "../../components/product/ProductCard";

type Product = {
  id: string;
  tag: string;
  name: string;
  price: string;
  image: any;
};

const PRODUCTS: Product[] = [
  {
    id: "1",
    tag: "BEST SELLER",
    name: "Nike Air Jordan Blue",
    price: "$493.00",
    image: require("../../assets/images/home/sp1.png"),
  },
  {
    id: "2",
    tag: "BEST SELLER",
    name: "Nike Air Max Red",
    price: "$399.00",
    image: require("../../assets/images/home/sp2.png"),
  },
  {
    id: "3",
    tag: "TRENDING",
    name: "Nike Runner Orange",
    price: "$429.00",
    image: require("../../assets/images/home/sp3.png"),
  },
  {
    id: "4",
    tag: "BEST CHOICE",
    name: "Nike Air Jordan 2022",
    price: "$849.69",
    image: require("../../assets/images/home/sp3_bestchoi.png"),
  },
  {
    id: "5",
    tag: "NEW",
    name: "Nike Zoom Purple",
    price: "$520.00",
    image: require("../../assets/images/home/sp4.png"),
  },
  {
    id: "6",
    tag: "NEW",
    name: "Puma Speed White",
    price: "$310.00",
    image: require("../../assets/images/home/sp5.jpg"),
  },
  {
    id: "7",
    tag: "NEW",
    name: "Puma Classic White",
    price: "$289.00",
    image: require("../../assets/images/home/sp8.jpg"),
  },
];

export default function ProductListScreen() {
  const router = useRouter();

  const renderItem: ListRenderItem<Product> = ({ item, index }) => (
    <ProductCard
      tag={item.tag}
      name={item.name}
      price={item.price}
      image={item.image}
      style={{ marginBottom: 20, marginRight: index % 2 === 0 ? 16 : 0 }}
      onPress={() =>
        router.push({ pathname: "/product/productDetail", params: { id: item.id } })
      }
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Products</Text>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
});
