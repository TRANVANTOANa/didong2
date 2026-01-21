// context/NotificationContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "order" | "promo" | "system" | "review";
    read: boolean;
    createdAt: Date;
    data?: Record<string, any>;
}

interface NotificationSettings {
    pushEnabled: boolean;
    emailEnabled: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newProducts: boolean;
    priceAlerts: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    settings: NotificationSettings;

    // Actions
    addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAllNotifications: () => void;

    // Settings
    updateSettings: (newSettings: Partial<NotificationSettings>) => void;
    togglePushNotifications: () => void;
    toggleEmailNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = "@app_notifications";
const NOTIFICATION_SETTINGS_KEY = "@notification_settings";

const defaultSettings: NotificationSettings = {
    pushEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    promotions: true,
    newProducts: true,
    priceAlerts: false,
};

// Sample notifications for demo
const sampleNotifications: Notification[] = [
    {
        id: "1",
        title: "Đơn hàng đã được xác nhận",
        message: "Đơn hàng #12345 của bạn đã được xác nhận và đang được chuẩn bị.",
        type: "order",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
        id: "2",
        title: "🎉 Giảm giá 20% hôm nay!",
        message: "Nhập mã SALE20 để được giảm 20% cho tất cả sản phẩm. Chỉ hôm nay!",
        type: "promo",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
        id: "3",
        title: "Sản phẩm mới đã về",
        message: "Nike Air Max 2024 mới nhất đã có hàng. Xem ngay!",
        type: "system",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
        id: "4",
        title: "Đánh giá sản phẩm",
        message: "Hãy đánh giá sản phẩm bạn vừa mua để nhận 50 điểm thưởng!",
        type: "review",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved data on mount
    useEffect(() => {
        loadSavedData();
    }, []);

    const loadSavedData = async () => {
        try {
            // Load notifications
            const savedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
            if (savedNotifications) {
                const parsed = JSON.parse(savedNotifications);
                // Convert date strings back to Date objects
                const notifs = parsed.map((n: any) => ({
                    ...n,
                    createdAt: new Date(n.createdAt),
                }));
                setNotifications(notifs);
            } else {
                // Use sample notifications for first time
                setNotifications(sampleNotifications);
                await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(sampleNotifications));
            }

            // Load settings
            const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error("Error loading notifications:", error);
            setNotifications(sampleNotifications);
        } finally {
            setIsLoading(false);
        }
    };

    const saveNotifications = async (notifs: Notification[]) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
        } catch (error) {
            console.error("Error saving notifications:", error);
        }
    };

    const saveSettings = async (newSettings: NotificationSettings) => {
        try {
            await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error("Error saving notification settings:", error);
        }
    };

    const addNotification = (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            read: false,
            createdAt: new Date(),
        };
        const updated = [newNotification, ...notifications];
        setNotifications(updated);
        saveNotifications(updated);
    };

    const markAsRead = (id: string) => {
        const updated = notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        );
        setNotifications(updated);
        saveNotifications(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        setNotifications(updated);
        saveNotifications(updated);
    };

    const deleteNotification = (id: string) => {
        const updated = notifications.filter((n) => n.id !== id);
        setNotifications(updated);
        saveNotifications(updated);
    };

    const clearAllNotifications = () => {
        Alert.alert(
            "Xóa tất cả thông báo",
            "Bạn có chắc muốn xóa tất cả thông báo?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => {
                        setNotifications([]);
                        saveNotifications([]);
                    },
                },
            ]
        );
    };

    const updateSettings = (newSettings: Partial<NotificationSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        saveSettings(updated);
    };

    const togglePushNotifications = () => {
        const newValue = !settings.pushEnabled;
        updateSettings({ pushEnabled: newValue });

        if (newValue) {
            Alert.alert(
                "Thông báo đã bật",
                "Bạn sẽ nhận được thông báo đẩy từ ứng dụng."
            );
        } else {
            Alert.alert(
                "Thông báo đã tắt",
                "Bạn sẽ không nhận được thông báo đẩy nữa."
            );
        }
    };

    const toggleEmailNotifications = () => {
        const newValue = !settings.emailEnabled;
        updateSettings({ emailEnabled: newValue });
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                settings,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearAllNotifications,
                updateSettings,
                togglePushNotifications,
                toggleEmailNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}

export type { Notification, NotificationSettings };
