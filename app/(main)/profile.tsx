import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScaledSize,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../../firebase/firebaseConfig';

interface MenuItem {
    id: number;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
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
                    name: data.name || user.displayName || "Chưa cập nhật",
                    email: data.email || user.email || "",
                    phone: data.phone || "Chưa cập nhật",
                    avatarUrl: data.avatarUrl || "",
                });
            } else {
                // Use data from Auth if no Firestore document
                setUserProfile({
                    name: user.displayName || "Chưa cập nhật",
                    email: user.email || "",
                    phone: "Chưa cập nhật",
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
            subtitle: 'Update your information',
            onPress: () => router.push('/account/edit-profile'),
        },
        {
            id: 2,
            icon: 'bag-outline',
            title: 'My Orders',
            subtitle: 'View your order history',
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
            subtitle: 'Manage shipping addresses',
            onPress: () => router.push('/account/address'),
        },
        {
            id: 5,
            icon: 'card-outline',
            title: 'Payment Methods',
            subtitle: 'Manage payment options',
            // Sau này tạo màn payment-methods thì đổi lại path
            onPress: () => console.log('Payment Methods'),
        },
        {
            id: 6,
            icon: 'heart-outline',
            title: 'Wishlist',
            subtitle: 'Your favorite items',
            onPress: () => router.push('/(main)/favorite'),
        },
        {
            id: 7,
            icon: 'notifications-outline',
            title: 'Notifications',
            subtitle: 'Notification preferences',
            onPress: () => console.log('Notifications'),
        },
        {
            id: 8,
            icon: 'settings-outline',
            title: 'Settings',
            subtitle: 'App preferences',
            onPress: () => router.push('/account/settings'),
        },
        {
            id: 9,
            icon: 'help-circle-outline',
            title: 'Help & Support',
            subtitle: 'Get help with your account',
            onPress: () => console.log('Help'),
        },
        {
            id: 10,
            icon: 'ticket-outline',
            title: 'Lucky Spin',
            subtitle: 'View and save vouchers',
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
            // Check if it's a base64 string or URL
            return (
                <Image
                    source={{ uri: userProfile.avatarUrl }}
                    style={[
                        styles.avatar,
                        { width: width * 0.22, height: width * 0.22 },
                    ]}
                    onError={() => {
                        // If image fails to load, update profile to remove broken URL
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
                { width: width * 0.22, height: width * 0.22 },
            ]}>
                <Ionicons name="person" size={40} color="#94A3B8" />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: height * 0.06 }]}>
                    <Text style={[styles.headerTitle, { fontSize: width * 0.065 }]}>
                        Profile
                    </Text>
                </View>

                {/* User Info Card */}
                <View style={[styles.userCard, { marginHorizontal: width * 0.05 }]}>
                    <View style={styles.avatarContainer}>
                        {isLoading ? (
                            <View style={[
                                styles.avatar,
                                styles.avatarPlaceholder,
                                { width: width * 0.22, height: width * 0.22 },
                            ]}>
                                <ActivityIndicator size="small" color="#5B9EE1" />
                            </View>
                        ) : (
                            renderAvatar()
                        )}
                        <TouchableOpacity
                            style={styles.editAvatarBtn}
                            onPress={handleEditProfile}
                        >
                            <Ionicons name="camera" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        {isLoading ? (
                            <>
                                <View style={styles.loadingText} />
                                <View style={[styles.loadingText, { width: '80%' }]} />
                            </>
                        ) : (
                            <>
                                <Text style={[styles.userName, { fontSize: width * 0.055 }]}>
                                    {userProfile?.name || "Chưa cập nhật"}
                                </Text>
                                <Text style={[styles.userEmail, { fontSize: width * 0.035 }]}>
                                    {userProfile?.email || ""}
                                </Text>
                                <Text style={[styles.userPhone, { fontSize: width * 0.035 }]}>
                                    {userProfile?.phone || "Chưa cập nhật"}
                                </Text>
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.editProfileBtn}
                        onPress={handleEditProfile}
                    >
                        <Ionicons name="create-outline" size={20} color="#5B9EE1" />
                    </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View
                    style={[
                        styles.menuContainer,
                        { marginTop: height * 0.03, marginHorizontal: width * 0.05 },
                    ]}
                >
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { paddingVertical: height * 0.02 }]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name={item.icon} size={24} color="#5B9EE1" />
                            </View>

                            <View style={styles.menuTextContainer}>
                                <Text style={[styles.menuTitle, { fontSize: width * 0.04 }]}>
                                    {item.title}
                                </Text>
                                <Text
                                    style={[styles.menuSubtitle, { fontSize: width * 0.032 }]}
                                >
                                    {item.subtitle}
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
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
                        { fontSize: width * 0.03, marginTop: height * 0.02 },
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
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#1A2530',
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        borderRadius: 50,
        backgroundColor: '#E8ECEF',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#5B9EE1',
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
        color: '#1A2530',
        marginBottom: 4,
    },
    userEmail: {
        color: '#778899',
        marginBottom: 2,
    },
    userPhone: {
        color: '#778899',
    },
    loadingText: {
        height: 16,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 8,
        width: '60%',
    },
    editProfileBtn: {
        padding: 8,
    },
    menuContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    menuTitle: {
        fontWeight: '600',
        color: '#1A2530',
        marginBottom: 3,
    },
    menuSubtitle: {
        color: '#9CA3AF',
    },
    logoutBtn: {
        backgroundColor: '#DC3545',
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#DC3545',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        color: '#B0B0B0',
        marginBottom: 20,
    },
});
