import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    ScaledSize,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../firebase/firebaseConfig';

interface MenuItem {
    id: number;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    badge?: number;
    onPress: () => void;
}

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
}

export default function ProfileScreen(): React.JSX.Element {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { unreadCount } = useNotifications();
    const [dimensions, setDimensions] = useState<ScaledSize>(
        Dimensions.get('window')
    );

    // User data from Firebase
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({
            window,
        }: {
            window: ScaledSize;
        }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    // Load user profile from Firebase
    const loadUserProfile = useCallback(async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                setIsLoading(false);
                return;
            }

            // Get from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserProfile({
                    name: data.name || user.displayName || "Not updated",
                    email: data.email || user.email || "",
                    phone: data.phone || "Not updated",
                    avatarUrl: data.avatarUrl || "",
                });
            } else {
                // Use data from Auth if no Firestore document
                setUserProfile({
                    name: user.displayName || "Not updated",
                    email: user.email || "",
                    phone: "Not updated",
                    avatarUrl: "",
                });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reload profile when screen is focused (after editing)
    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, [loadUserProfile])
    );

    const { width, height } = dimensions;

    const menuItems: MenuItem[] = [
        {
            id: 1,
            icon: 'person-outline',
            title: 'Edit Profile',
            subtitle: 'Update personal information',
            onPress: () => router.push('/account/edit-profile'),
        },
        {
            id: 2,
            icon: 'bag-outline',
            title: 'My Orders',
            subtitle: 'View order history',
            onPress: () => router.push('/account/my-orders'),
        },
        {
            id: 3,
            icon: 'ticket-outline',
            title: 'Vouchers',
            subtitle: 'View and save vouchers',
            onPress: () => router.push('/account/vouchers'),
        },
        {
            id: 4,
            icon: 'location-outline',
            title: 'Delivery Address',
            subtitle: 'Manage delivery addresses',
            onPress: () => router.push('/account/address'),
        },
        {
            id: 5,
            icon: 'card-outline',
            title: 'Payment Methods',
            subtitle: 'Manage cards and e-wallets',
            onPress: () => console.log('Payment Methods'),
        },
        {
            id: 6,
            icon: 'heart-outline',
            title: 'Favorites',
            subtitle: 'Saved products',
            onPress: () => router.push('/(main)/favorite'),
        },
        {
            id: 7,
            icon: 'notifications-outline',
            title: 'Notifications',
            subtitle: unreadCount > 0 ? `${unreadCount} new notifications` : 'View all notifications',
            badge: unreadCount,
            onPress: () => router.push('/account/notifications'),
        },
        {
            id: 8,
            icon: 'settings-outline',
            title: 'Settings',
            subtitle: 'Dark mode, notifications, security',
            onPress: () => router.push('/account/settings'),
        },
        {
            id: 9,
            icon: 'help-circle-outline',
            title: 'Help & Support',
            subtitle: 'Contact support',
            onPress: () => console.log('Help'),
        },
        {
            id: 10,
            icon: 'gift-outline',
            title: 'Lucky Spin',
            subtitle: 'Get free vouchers',
            onPress: () => router.push('/account/lucky-spin'),
        },
    ];

    const handleLogout = (): void => {
        auth.signOut().then(() => {
            console.log('Logged out');
            router.push('/(auth)/login');
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    };

    const handleEditProfile = (): void => {
        router.push('/account/edit-profile');
    };

    // Render avatar based on avatarUrl
    const renderAvatar = () => {
        if (userProfile?.avatarUrl) {
            return (
                <Image
                    source={{ uri: userProfile.avatarUrl }}
                    style={[
                        styles.avatar,
                        { width: width * 0.22, height: width * 0.22 },
                    ]}
                    onError={() => {
                        setUserProfile(prev => prev ? { ...prev, avatarUrl: "" } : null);
                    }}
                />
            );
        }

        // Default placeholder
        return (
            <View style={[
                styles.avatar,
                styles.avatarPlaceholder,
                {
                    width: width * 0.22,
                    height: width * 0.22,
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                },
            ]}>
                <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: height * 0.06, backgroundColor: colors.card }]}>
                    <Text style={[styles.headerTitle, { fontSize: width * 0.065, color: colors.text }]}>
                        Profile
                    </Text>
                    <TouchableOpacity
                        style={[styles.themeToggle, { backgroundColor: colors.inputBackground }]}
                        onPress={() => router.push('/account/settings')}
                    >
                        <Ionicons
                            name={isDarkMode ? "moon" : "sunny"}
                            size={20}
                            color={isDarkMode ? "#60A5FA" : "#F59E0B"}
                        />
                    </TouchableOpacity>
                </View>

                {/* User Info Card */}
                <View style={[styles.userCard, { marginHorizontal: width * 0.05, backgroundColor: colors.card }]}>
                    <View style={styles.avatarContainer}>
                        {isLoading ? (
                            <View style={[
                                styles.avatar,
                                styles.avatarPlaceholder,
                                {
                                    width: width * 0.22,
                                    height: width * 0.22,
                                    backgroundColor: colors.inputBackground,
                                },
                            ]}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : (
                            renderAvatar()
                        )}
                        <TouchableOpacity
                            style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]}
                            onPress={handleEditProfile}
                        >
                            <Ionicons name="camera" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        {isLoading ? (
                            <>
                                <View style={[styles.loadingText, { backgroundColor: colors.inputBackground }]} />
                                <View style={[styles.loadingText, { width: '80%', backgroundColor: colors.inputBackground }]} />
                            </>
                        ) : (
                            <>
                                <Text style={[styles.userName, { fontSize: width * 0.055, color: colors.text }]}>
                                    {userProfile?.name || "Not updated"}
                                </Text>
                                <Text style={[styles.userEmail, { fontSize: width * 0.035, color: colors.textSecondary }]}>
                                    {userProfile?.email || ""}
                                </Text>
                                <Text style={[styles.userPhone, { fontSize: width * 0.035, color: colors.textSecondary }]}>
                                    {userProfile?.phone || "Not updated"}
                                </Text>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.editProfileBtn}
                        onPress={handleEditProfile}
                    >
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View
                    style={[
                        styles.menuContainer,
                        { marginTop: height * 0.03, marginHorizontal: width * 0.05, backgroundColor: colors.card },
                    ]}
                >
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { paddingVertical: height * 0.02, borderBottomColor: colors.divider }]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.primaryLight }]}>
                                <Ionicons name={item.icon} size={24} color={colors.primary} />
                            </View>

                            <View style={styles.menuTextContainer}>
                                <Text style={[styles.menuTitle, { fontSize: width * 0.04, color: colors.text }]}>
                                    {item.title}
                                </Text>
                                <Text
                                    style={[styles.menuSubtitle, { fontSize: width * 0.032, color: colors.textMuted }]}
                                >
                                    {item.subtitle}
                                </Text>
                            </View>

                            {item.badge && item.badge > 0 ? (
                                <View style={styles.menuBadge}>
                                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                                </View>
                            ) : (
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[
                        styles.logoutBtn,
                        {
                            marginHorizontal: width * 0.05,
                            marginTop: height * 0.03,
                            paddingVertical: height * 0.02,
                        },
                    ]}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
                    <Text style={[styles.logoutText, { fontSize: width * 0.04 }]}>
                        Logout
                    </Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text
                    style={[
                        styles.versionText,
                        { fontSize: width * 0.03, marginTop: height * 0.02, color: colors.textMuted },
                    ]}
                >
                    Version 1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontWeight: 'bold',
    },
    themeToggle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userCard: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        borderRadius: 50,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
        marginLeft: 15,
    },
    userName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        marginBottom: 2,
    },
    userPhone: {},
    loadingText: {
        height: 16,
        borderRadius: 4,
        marginBottom: 8,
        width: '60%',
    },
    editProfileBtn: {
        padding: 8,
    },
    menuContainer: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    menuTitle: {
        fontWeight: '600',
        marginBottom: 3,
    },
    menuSubtitle: {},
    menuBadge: {
        backgroundColor: '#EF4444',
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    menuBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    logoutBtn: {
        backgroundColor: '#DC3545',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#DC3545',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    logoutText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        marginBottom: 20,
    },
});
