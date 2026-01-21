// app/account/notifications.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Notification, useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";

const getNotificationIcon = (type: Notification["type"]): keyof typeof Ionicons.glyphMap => {
    switch (type) {
        case "order":
            return "cube";
        case "promo":
            return "pricetag";
        case "review":
            return "star";
        case "system":
        default:
            return "notifications";
    }
};

const getNotificationColor = (type: Notification["type"]): string => {
    switch (type) {
        case "order":
            return "#3B82F6";
        case "promo":
            return "#F59E0B";
        case "review":
            return "#10B981";
        case "system":
        default:
            return "#8B5CF6";
    }
};

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-US");
};

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
    } = useNotifications();

    const renderNotification = ({ item }: { item: Notification }) => {
        const iconName = getNotificationIcon(item.type);
        const iconColor = getNotificationColor(item.type);

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    { backgroundColor: colors.card },
                    !item.read && { backgroundColor: isDarkMode ? "#1E3A5F" : "#EFF6FF" },
                ]}
                onPress={() => markAsRead(item.id)}
                activeOpacity={0.7}
            >
                {/* Unread Indicator */}
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}

                {/* Icon */}
                <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}20` }]}>
                    <Ionicons name={iconName} size={20} color={iconColor} />
                </View>

                {/* Content */}
                <View style={styles.contentWrapper}>
                    <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                        {formatTimeAgo(item.createdAt)}
                    </Text>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteNotification(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                You will receive notifications when there are new updates
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                <TouchableOpacity
                    style={[styles.headerBtn, { backgroundColor: colors.card }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.icon} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                {notifications.length > 0 ? (
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: colors.card }]}
                        onPress={markAllAsRead}
                    >
                        <Ionicons name="checkmark-done" size={22} color={colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <View style={[styles.unreadBanner, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="mail-unread" size={18} color={colors.primary} />
                    <Text style={[styles.unreadBannerText, { color: colors.primary }]}>
                        You have {unreadCount} unread notifications
                    </Text>
                </View>
            )}

            {/* Notifications List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />

            {/* Clear All Button */}
            {notifications.length > 0 && (
                <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
                    <TouchableOpacity
                        style={[styles.clearAllBtn, { borderColor: colors.error }]}
                        onPress={clearAllNotifications}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                        <Text style={[styles.clearAllText, { color: colors.error }]}>Clear all</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "ios" ? 50 : 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    unreadBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        gap: 8,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 10,
    },
    unreadBannerText: {
        fontSize: 13,
        fontWeight: "600",
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    notificationItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        position: "relative",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    unreadDot: {
        position: "absolute",
        left: 6,
        top: "50%",
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: -4,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    contentWrapper: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 6,
    },
    notificationTime: {
        fontSize: 11,
    },
    deleteBtn: {
        padding: 4,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: Platform.OS === "ios" ? 30 : 16,
        borderTopWidth: 1,
    },
    clearAllBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    clearAllText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
