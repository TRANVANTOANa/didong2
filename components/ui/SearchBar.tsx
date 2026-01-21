// components/SearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (keyword: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  initialValue = "",
  onSearch,
  placeholder = "Tìm kiếm sản phẩm...",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [keyword, setKeyword] = useState(initialValue);

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    if (onSearch) {
      onSearch(trimmedKeyword);
    } else if (trimmedKeyword) {
      router.push({
        pathname: "/products",
        params: { search: trimmedKeyword },
      });
    }
  };

  const handleClear = () => {
    setKeyword("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Search Icon */}
      <TouchableOpacity onPress={handleSearch} style={styles.searchIconBtn}>
        <Ionicons name="search" size={20} color={colors.primary} />
      </TouchableOpacity>

      {/* Input */}
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        autoFocus={autoFocus}
      />

      {/* Clear Button */}
      {keyword.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Search Button */}
      <TouchableOpacity
        onPress={handleSearch}
        style={[styles.searchBtn, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIconBtn: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  clearBtn: {
    marginRight: 8,
    padding: 4,
  },
  searchBtn: {
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
