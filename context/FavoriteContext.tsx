import React, { createContext, ReactNode, useContext, useState } from "react";

export type FavoriteItem = {
  id: string;
  name: string;
  tag: string;
  price: string;
  image: any; // Allow string URL or require(...) object
};

type FavoriteContextType = {
  favorites: FavoriteItem[];
  addToFavorite: (item: FavoriteItem) => void;
  removeFromFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
};

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addToFavorite = (item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.some(p => p.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const isFavorite = (id: string) => {
    return favorites.some(item => item.id === id);
  };

  const toggleFavorite = (item: FavoriteItem) => {
    isFavorite(item.id)
      ? removeFromFavorite(item.id)
      : addToFavorite(item);
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        addToFavorite,
        removeFromFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const ctx = useContext(FavoriteContext);
  if (!ctx) {
    throw new Error("useFavorite must be used inside FavoriteProvider");
  }
  return ctx;
}
