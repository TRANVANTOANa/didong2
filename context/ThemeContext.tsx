// context/ThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

interface ThemeColors {
    // Backgrounds
    background: string;
    surface: string;
    card: string;
    modal: string;

    // Text
    text: string;
    textSecondary: string;
    textMuted: string;

    // Primary & Accent
    primary: string;
    primaryLight: string;
    accent: string;

    // Status
    success: string;
    warning: string;
    error: string;

    // Borders & Dividers
    border: string;
    divider: string;

    // Input
    inputBackground: string;
    placeholder: string;

    // Icons
    icon: string;
    iconMuted: string;

    // Shadows
    shadow: string;
}

const lightTheme: ThemeColors = {
    // Backgrounds
    background: "#F8FAFC",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    modal: "#FFFFFF",

    // Text
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",

    // Primary & Accent
    primary: "#5B9EE1",
    primaryLight: "#E0F2FE",
    accent: "#FF6B6B",

    // Status
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",

    // Borders & Dividers
    border: "#E2E8F0",
    divider: "#F1F5F9",

    // Input
    inputBackground: "#F1F5F9",
    placeholder: "#94A3B8",

    // Icons
    icon: "#0F172A",
    iconMuted: "#94A3B8",

    // Shadows
    shadow: "#000000",
};

const darkTheme: ThemeColors = {
    // Backgrounds
    background: "#0F172A",
    surface: "#1E293B",
    card: "#1E293B",
    modal: "#1E293B",

    // Text
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#64748B",

    // Primary & Accent
    primary: "#60A5FA",
    primaryLight: "#1E3A5F",
    accent: "#F87171",

    // Status
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",

    // Borders & Dividers
    border: "#334155",
    divider: "#334155",

    // Input
    inputBackground: "#334155",
    placeholder: "#64748B",

    // Icons
    icon: "#F8FAFC",
    iconMuted: "#64748B",

    // Shadows
    shadow: "#000000",
};

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
    setDarkMode: (value: boolean) => void;
    colors: ThemeColors;
    theme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@app_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme on mount
    useEffect(() => {
        loadSavedTheme();
    }, []);

    const loadSavedTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === "dark");
            } else {
                // Use system theme as default
                setIsDarkMode(systemColorScheme === "dark");
            }
        } catch (error) {
            console.error("Error loading theme:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTheme = async (dark: boolean) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    };

    const toggleTheme = () => {
        const newValue = !isDarkMode;
        setIsDarkMode(newValue);
        saveTheme(newValue);
    };

    const setDarkModeValue = (value: boolean) => {
        setIsDarkMode(value);
        saveTheme(value);
    };

    const colors = isDarkMode ? darkTheme : lightTheme;
    const theme = isDarkMode ? "dark" : "light";

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleTheme,
                setDarkMode: setDarkModeValue,
                colors,
                theme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

export { darkTheme, lightTheme };
export type { ThemeColors };

