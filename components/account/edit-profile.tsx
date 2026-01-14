// app/account/edit-profile.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db, storage } from "../../firebase/firebaseConfig";

// Interface cho profile data
interface UserProfile {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    avatarUrl: string;
    updatedAt?: any;
    createdAt?: any;
}

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 📦 Load profile từ Firebase khi mở screen
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập để xem hồ sơ");
                router.back();
                return;
            }

            // Lấy email từ Firebase Auth
            setEmail(user.email || "");

            // Lấy profile từ Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data() as UserProfile;
                setName(data.name || user.displayName || "");
                setPhone(data.phone || "");
                setDateOfBirth(data.dateOfBirth || "");
                setGender(data.gender || "");
                if (data.avatarUrl) {
                    setAvatarUrl(data.avatarUrl);
                }
            } else {
                // Nếu chưa có profile, dùng displayName từ Auth
                setName(user.displayName || "");
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ");
        } finally {
            setIsLoading(false);
        }
    };

    // 📤 Upload avatar lên Firebase Storage
    const uploadAvatar = async (uri: string): Promise<string | null> => {
        try {
            const user = auth.currentUser;
            if (!user) return null;

            // Fetch image blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Tạo reference cho file
            const avatarRef = ref(storage, `avatars/${user.uid}/profile.jpg`);

            // Upload file
            await uploadBytes(avatarRef, blob);

            // Lấy URL download
            const downloadUrl = await getDownloadURL(avatarRef);
            return downloadUrl;
        } catch (error) {
            console.error("Error uploading avatar:", error);
            return null;
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission needed",
                "Please grant camera roll permissions to change your avatar."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setAvatar(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission needed",
                "Please grant camera permissions to take a photo."
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setAvatar(result.assets[0].uri);
        }
    };

    const showImageOptions = () => {
        Alert.alert("Change Avatar", "Choose an option", [
            { text: "Take Photo", onPress: takePhoto },
            { text: "Choose from Library", onPress: pickImage },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    // 💾 Lưu profile vào Firebase
    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            Alert.alert("Error", "Please enter a valid email");
            return;
        }

        try {
            setIsSaving(true);
            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
                return;
            }

            let finalAvatarUrl = avatarUrl;

            // Nếu có avatar mới được chọn, upload lên Storage
            if (avatar) {
                const uploadedUrl = await uploadAvatar(avatar);
                if (uploadedUrl) {
                    finalAvatarUrl = uploadedUrl;
                }
            }

            // Chuẩn bị data để lưu
            const profileData: UserProfile = {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                dateOfBirth: dateOfBirth,
                gender: gender,
                avatarUrl: finalAvatarUrl || "",
                updatedAt: serverTimestamp(),
            };

            // Kiểm tra xem document đã tồn tại chưa
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Nếu chưa có, thêm createdAt
                profileData.createdAt = serverTimestamp();
            }

            // Lưu vào Firestore
            await setDoc(userDocRef, profileData, { merge: true });

            Alert.alert("Thành công", "Hồ sơ đã được cập nhật!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#5B9EE1" />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={showImageOptions}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <Image
                                source={require("../../assets/images/home/user.png")}
                                style={styles.avatar}
                            />
                        )}
                        <View style={styles.editAvatarBtn}>
                            <Ionicons name="camera" size={18} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Tap to change photo</Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#94A3B8" />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={20} color="#94A3B8" />
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity style={styles.inputWrapper}>
                            <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
                            <Text style={styles.placeholderText}>Select date of birth</Text>
                            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <TouchableOpacity style={styles.inputWrapper}>
                            <Ionicons name="transgender-outline" size={20} color="#94A3B8" />
                            <Text style={styles.placeholderText}>Select gender</Text>
                            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <Text style={styles.saveText}>Saving...</Text>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
                            <Text style={styles.saveText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#E8ECEF",
    },
    editAvatarBtn: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#5B9EE1",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    changePhotoText: {
        marginTop: 12,
        fontSize: 14,
        color: "#64748B",
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#F8FAFC",
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#0F172A",
    },
    placeholderText: {
        flex: 1,
        fontSize: 15,
        color: "#94A3B8",
    },
    saveBtn: {
        flexDirection: "row",
        backgroundColor: "#5B9EE1",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 24,
        shadowColor: "#5B9EE1",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#64748B",
    },
});
