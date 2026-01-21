// app/account/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";

interface SettingItem {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    type: "switch" | "link" | "action";
    value?: boolean;
    onPress?: () => void;
}

export default function SettingsScreen() {
    const router = useRouter();
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const { settings, togglePushNotifications, toggleEmailNotifications, unreadCount } = useNotifications();

    const [faceId, setFaceId] = React.useState(false);
    const [locationServices, setLocationServices] = React.useState(true);

    const handleClearCache = () => {
        Alert.alert(
            "Clear Cache",
            "This will clear all cached data. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear", style: "destructive", onPress: () => {
                        Alert.alert("Success", "Cache cleared successfully");
                    }
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This action cannot be undone. All your data will be permanently deleted.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: () => {
                        router.push("/(auth)/login");
                    }
                },
            ]
        );
    };

    const handleOpenPrivacy = () => {
        Linking.openURL("https://your-privacy-policy-url.com");
    };

    const handleOpenTerms = () => {
        Linking.openURL("https://your-terms-of-service-url.com");
    };

    const handleRateApp = () => {
        Alert.alert("Rate App", "Thank you for using the app! We appreciate your feedback.");
    };

    const renderSection = (title: string, items: SettingItem[]) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
                {items.map((item, index) => (
                    <View key={item.id}>
                        {item.type === "switch" ? (
                            <View style={styles.settingRow}>
                                <View style={[
                                    styles.settingIcon,
                                    { backgroundColor: isDarkMode ? colors.primaryLight : "#F0F7FF" }
                                ]}>
                                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                                    {item.subtitle && (
                                        <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                                    )}
                                </View>
                                <Switch
                                    value={item.value}
                                    onValueChange={item.onPress as any}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                    thumbColor={item.value ? "#FFFFFF" : "#94A3B8"}
                                    ios_backgroundColor={colors.border}
                                />
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.settingRow}
                                onPress={item.onPress}
                            >
                                <View style={[
                                    styles.settingIcon,
                                    item.id === "delete" && styles.dangerIcon,
                                    { backgroundColor: item.id === "delete" ? "#FEE2E2" : (isDarkMode ? colors.primaryLight : "#F0F7FF") }
                                ]}>
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={item.id === "delete" ? "#EF4444" : colors.primary}
                                    />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={[
                                        styles.settingTitle,
                                        { color: colors.text },
                                        item.id === "delete" && styles.dangerText
                                    ]}>
                                        {item.title}
                                    </Text>
                                    {item.subtitle && (
                                        <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                        {index < items.length - 1 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                    </View>
                ))}
            </View>
        </View>
    );

    const appearanceSettings: SettingItem[] = [
        {
            id: "dark",
            icon: "moon-outline",
            title: "Dark Mode",
            subtitle: isDarkMode ? "On" : "Off",
            type: "switch",
            value: isDarkMode,
            onPress: toggleTheme,
        },
    ];

    const notificationSettings: SettingItem[] = [
        {
            id: "notifications",
            icon: "notifications-outline",
            title: "Push Notifications",
            subtitle: settings.pushEnabled ? "On" : "Off",
            type: "switch",
            value: settings.pushEnabled,
            onPress: togglePushNotifications,
        },
        {
            id: "email",
            icon: "mail-outline",
            title: "Email Notifications",
            subtitle: "Receive promotional emails",
            type: "switch",
            value: settings.emailEnabled,
            onPress: toggleEmailNotifications,
        },
        {
            id: "view_notifications",
            icon: "notifications",
            title: "View Notifications",
            subtitle: unreadCount > 0 ? `${unreadCount} unread` : "No new notifications",
            type: "link",
            onPress: () => router.push("/account/notifications"),
        },
    ];

    const securitySettings: SettingItem[] = [
        {
            id: "faceid",
            icon: "finger-print-outline",
            title: "Face ID / Touch ID",
            subtitle: "Biometric authentication",
            type: "switch",
            value: faceId,
            onPress: () => setFaceId(!faceId),
        },
        {
            id: "location",
            icon: "location-outline",
            title: "Location Services",
            subtitle: "Allow app to access location",
            type: "switch",
            value: locationServices,
            onPress: () => setLocationServices(!locationServices),
        },
        {
            id: "password",
            icon: "lock-closed-outline",
            title: "Change Password",
            type: "link",
            onPress: () => Alert.alert("Change Password", "This feature is coming soon"),
        },
    ];

    const supportSettings: SettingItem[] = [
        {
            id: "rate",
            icon: "star-outline",
            title: "Rate App",
            subtitle: "Help us improve",
            type: "link",
            onPress: handleRateApp,
        },
        {
            id: "privacy",
            icon: "shield-outline",
            title: "Privacy Policy",
            type: "link",
            onPress: handleOpenPrivacy,
        },
        {
            id: "terms",
            icon: "document-text-outline",
            title: "Terms of Service",
            type: "link",
            onPress: handleOpenTerms,
        },
    ];

    const dangerSettings: SettingItem[] = [
        {
            id: "cache",
            icon: "trash-outline",
            title: "Clear Cache",
            subtitle: "Free up storage space",
            type: "action",
            onPress: handleClearCache,
        },
        {
            id: "delete",
            icon: "warning-outline",
            title: "Delete Account",
            subtitle: "Permanently delete your account",
            type: "action",
            onPress: handleDeleteAccount,
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                <TouchableOpacity
                    style={[styles.backBtn, { backgroundColor: colors.card }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.icon} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Theme Preview Card */}
                <View style={[styles.themePreviewCard, { backgroundColor: colors.card }]}>
                    <View style={styles.themePreviewContent}>
                        <View style={[styles.themeIconWrapper, { backgroundColor: isDarkMode ? "#1E3A5F" : "#FEF3C7" }]}>
                            <Ionicons
                                name={isDarkMode ? "moon" : "sunny"}
                                size={28}
                                color={isDarkMode ? "#60A5FA" : "#F59E0B"}
                            />
                        </View>
                        <View style={styles.themePreviewText}>
                            <Text style={[styles.themePreviewTitle, { color: colors.text }]}>
                                {isDarkMode ? "Dark Mode" : "Light Mode"}
                            </Text>
                            <Text style={[styles.themePreviewSubtitle, { color: colors.textMuted }]}>
                                {isDarkMode
                                    ? "Reduce eye strain in low light"
                                    : "Best for daylight"}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={isDarkMode ? "#FFFFFF" : "#94A3B8"}
                        ios_backgroundColor={colors.border}
                    />
                </View>

                {renderSection("NOTIFICATIONS", notificationSettings)}
                {renderSection("SECURITY", securitySettings)}
                {renderSection("SUPPORT", supportSettings)}
                {renderSection("DANGER ZONE", dangerSettings)}

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={[styles.versionText, { color: colors.textMuted }]}>Version 1.0.0</Text>
                    <Text style={[styles.buildText, { color: colors.textMuted }]}>Build 2026.01.20</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "ios" ? 50 : 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
            },
            android: {
                elevation: 2,
            },
        }),
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    // Theme Preview Card
    themePreviewCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 4,
            },
        }),
    },
    themePreviewContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    themeIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    themePreviewText: {
        marginLeft: 14,
        flex: 1,
    },
    themePreviewTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    themePreviewSubtitle: {
        fontSize: 12,
        lineHeight: 16,
    },
    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 12,
        marginLeft: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    sectionCard: {
        borderRadius: 16,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
            },
            android: {
                elevation: 2,
            },
        }),
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    dangerIcon: {
        backgroundColor: "#FEE2E2",
    },
    settingInfo: {
        flex: 1,
        marginLeft: 14,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    dangerText: {
        color: "#EF4444",
    },
    settingSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginLeft: 70,
    },
    versionContainer: {
        alignItems: "center",
        paddingVertical: 24,
    },
    versionText: {
        fontSize: 14,
        fontWeight: "600",
    },
    buildText: {
        fontSize: 12,
        marginTop: 4,
    },
});
