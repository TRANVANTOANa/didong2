// app/account/edit-profile.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";

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

const GENDER_OPTIONS = ["Male", "Female", "Other"];

// Generate arrays for date picker
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [gender, setGender] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    // Temp date selection state
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedYear, setSelectedYear] = useState(currentYear - 20);
    const [dateStep, setDateStep] = useState<'day' | 'month' | 'year'>('day');

    // Validation state - hiển thị warning khi thiếu thông tin
    const [showValidation, setShowValidation] = useState(false);

    // Prevent multiple loads
    const hasLoaded = useRef(false);

    // 📦 Load profile từ Firebase khi mở screen
    const loadUserProfile = useCallback(async () => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Error", "Please login to view profile");
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
                setGender(data.gender || "");
                if (data.dateOfBirth) {
                    const date = new Date(data.dateOfBirth);
                    setDateOfBirth(date);
                    setSelectedDay(date.getDate());
                    setSelectedMonth(date.getMonth());
                    setSelectedYear(date.getFullYear());
                }
                if (data.avatarUrl) {
                    setAvatarUrl(data.avatarUrl);
                }
            } else {
                // Nếu chưa có profile, dùng displayName từ Auth
                setName(user.displayName || "");
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert("Error", "Unable to load profile information");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    // 📤 Resize và nén ảnh trước khi chuyển base64 (cho web)
    const imageToBase64Web = async (uri: string): Promise<string | null> => {
        try {
            return new Promise((resolve, reject) => {
                const img = document.createElement('img');
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    // Resize ảnh xuống max 300x300 để giảm kích thước
                    const maxSize = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round((height * maxSize) / width);
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round((width * maxSize) / height);
                            height = maxSize;
                        }
                    }

                    // Vẽ ảnh đã resize lên canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Chuyển thành base64 với chất lượng 0.7 (70%)
                    const base64 = canvas.toDataURL('image/jpeg', 0.7);
                    console.log('Compressed image size:', Math.round(base64.length / 1024), 'KB');
                    resolve(base64);
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                img.src = uri;
            });
        } catch (error) {
            console.error("Error converting to base64:", error);
            return null;
        }
    };

    // 📤 Chuyển ảnh thành base64 trên mobile bằng fetch + blob reader
    const imageToBase64Mobile = async (uri: string): Promise<string | null> => {
        try {
            console.log("Mobile: Converting image to base64...");

            // Fetch the image as blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Convert blob to base64
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    console.log('Mobile image base64 size:', Math.round(base64String.length / 1024), 'KB');
                    resolve(base64String);
                };
                reader.onerror = () => {
                    reject(new Error('Failed to read blob'));
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting mobile image to base64:", error);
            return null;
        }
    };

    // 📤 Upload avatar - chuyển thành base64 và lưu vào Firestore
    const uploadAvatar = async (uri: string): Promise<string | null> => {
        try {
            const user = auth.currentUser;
            if (!user) return null;

            console.log("Platform:", Platform.OS);
            console.log("Image URI:", uri);

            let base64: string | null = null;

            // Trên web, sử dụng canvas để resize và nén
            if (Platform.OS === "web") {
                console.log("Web platform: Converting image to base64...");
                base64 = await imageToBase64Web(uri);
            } else {
                // Trên mobile, sử dụng fetch + FileReader
                console.log("Mobile platform: Converting image to base64...");
                base64 = await imageToBase64Mobile(uri);
            }

            if (base64) {
                console.log("Image converted to base64 successfully");
                console.log("Base64 length:", base64.length);

                // Kiểm tra kích thước - Firestore có giới hạn 1MB cho mỗi document
                // Base64 ~1.37x kích thước gốc, nên giới hạn ~700KB
                if (base64.length > 700000) {
                    Alert.alert(
                        "Image too large",
                        "Please choose a smaller image.",
                        [{ text: "OK" }]
                    );
                    return null;
                }

                return base64;
            }

            return null;
        } catch (error: any) {
            console.error("Error processing avatar:", error);
            Alert.alert(
                "Error",
                "Unable to process image. Please try again with another image."
            );
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
            mediaTypes: ["images"],
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
        if (Platform.OS === "web") {
            // On web, directly open file picker
            pickImage();
        } else {
            Alert.alert("Change Avatar", "Choose an option", [
                { text: "Take Photo", onPress: takePhoto },
                { text: "Choose from Library", onPress: pickImage },
                { text: "Cancel", style: "cancel" },
            ]);
        }
    };

    // Open date picker
    const openDatePicker = () => {
        if (dateOfBirth) {
            setSelectedDay(dateOfBirth.getDate());
            setSelectedMonth(dateOfBirth.getMonth());
            setSelectedYear(dateOfBirth.getFullYear());
        }
        setDateStep('day');
        setShowDatePicker(true);
    };

    // Confirm date selection
    const confirmDateSelection = () => {
        const newDate = new Date(selectedYear, selectedMonth, selectedDay);
        setDateOfBirth(newDate);
        setShowDatePicker(false);
    };

    // Format date for display
    const formatDate = (date: Date | null): string => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // 💾 Lưu profile vào Firebase
    const handleSave = async () => {
        // Bật validation để hiển thị warning
        setShowValidation(true);

        // Vẫn cho lưu dù thiếu thông tin, chỉ cần có email hợp lệ từ Auth
        if (!email.trim() || !email.includes("@")) {
            Alert.alert("Error", "Invalid email");
            return;
        }

        try {
            setIsSaving(true);
            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Error", "Please login again");
                return;
            }

            let finalAvatarUrl = avatarUrl || "";
            let avatarUploadFailed = false;

            // Nếu có avatar mới được chọn, thử upload lên Storage
            if (avatar) {
                console.log("Attempting to upload avatar...");
                const uploadedUrl = await uploadAvatar(avatar);
                if (uploadedUrl) {
                    finalAvatarUrl = uploadedUrl;
                } else {
                    avatarUploadFailed = true;
                    console.log("Avatar upload failed, continuing with other data...");
                }
            }

            // Chuẩn bị data để lưu
            const profileData: UserProfile = {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : "",
                gender: gender,
                avatarUrl: finalAvatarUrl,
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

            // Thông báo kết quả
            if (avatarUploadFailed) {
                Alert.alert(
                    "Partially Saved",
                    "Profile information saved, but avatar could not be uploaded on web. Try using the mobile app to upload avatar.",
                    [{ text: "OK", onPress: () => router.back() }]
                );
            } else {
                Alert.alert("Success", "Profile updated!", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Unable to save information. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#5B9EE1" />
                <Text style={styles.loadingText}>Loading information...</Text>
            </View>
        );
    }

    // Render date step content
    const renderDateStepContent = () => {
        switch (dateStep) {
            case 'day':
                return (
                    <View style={styles.dateGrid}>
                        {DAYS.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dateGridItem,
                                    selectedDay === day && styles.dateGridItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedDay(day);
                                    setDateStep('month');
                                }}
                            >
                                <Text
                                    style={[
                                        styles.dateGridText,
                                        selectedDay === day && styles.dateGridTextSelected,
                                    ]}
                                >
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'month':
                return (
                    <View style={styles.monthGrid}>
                        {MONTHS.map((month) => (
                            <TouchableOpacity
                                key={month.value}
                                style={[
                                    styles.monthGridItem,
                                    selectedMonth === month.value && styles.monthGridItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedMonth(month.value);
                                    setDateStep('year');
                                }}
                            >
                                <Text
                                    style={[
                                        styles.monthGridText,
                                        selectedMonth === month.value && styles.monthGridTextSelected,
                                    ]}
                                >
                                    {month.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'year':
                return (
                    <ScrollView style={styles.yearScroll} showsVerticalScrollIndicator={false}>
                        {YEARS.map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={[
                                    styles.yearItem,
                                    selectedYear === year && styles.yearItemSelected,
                                ]}
                                onPress={() => {
                                    setSelectedYear(year);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.yearText,
                                        selectedYear === year && styles.yearTextSelected,
                                    ]}
                                >
                                    {year}
                                </Text>
                                {selectedYear === year && (
                                    <Ionicons name="checkmark-circle" size={24} color="#5B9EE1" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                );
        }
    };

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
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatar}
                                onError={() => setAvatarUrl(null)}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={50} color="#94A3B8" />
                            </View>
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
                        <Text style={styles.label}>Full Name {showValidation && !name.trim() && <Text style={styles.requiredStar}>*</Text>}</Text>
                        <View style={[styles.inputWrapper, showValidation && !name.trim() && styles.inputWrapperError]}>
                            <Ionicons name="person-outline" size={20} color={showValidation && !name.trim() ? "#EF4444" : "#94A3B8"} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                        {showValidation && !name.trim() && (
                            <Text style={styles.errorText}>Please enter your full name</Text>
                        )}
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
                        <Text style={styles.label}>Phone Number {showValidation && !phone.trim() && <Text style={styles.requiredStar}>*</Text>}</Text>
                        <View style={[styles.inputWrapper, showValidation && !phone.trim() && styles.inputWrapperError]}>
                            <Ionicons name="call-outline" size={20} color={showValidation && !phone.trim() ? "#EF4444" : "#94A3B8"} />
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                            />
                        </View>
                        {showValidation && !phone.trim() && (
                            <Text style={styles.errorText}>Please enter your phone number</Text>
                        )}
                    </View>

                    {/* Date of Birth - Clickable */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth {showValidation && !dateOfBirth && <Text style={styles.requiredStar}>*</Text>}</Text>
                        <TouchableOpacity
                            style={[styles.inputWrapper, showValidation && !dateOfBirth && styles.inputWrapperError]}
                            onPress={openDatePicker}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="calendar-outline" size={20} color={showValidation && !dateOfBirth ? "#EF4444" : "#94A3B8"} />
                            <Text style={dateOfBirth ? styles.inputText : styles.placeholderText}>
                                {dateOfBirth ? formatDate(dateOfBirth) : "Select date of birth"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={showValidation && !dateOfBirth ? "#EF4444" : "#94A3B8"} />
                        </TouchableOpacity>
                        {showValidation && !dateOfBirth && (
                            <Text style={styles.errorText}>Please select date of birth</Text>
                        )}
                    </View>

                    {/* Gender - Clickable */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender {showValidation && !gender && <Text style={styles.requiredStar}>*</Text>}</Text>
                        <TouchableOpacity
                            style={[styles.inputWrapper, showValidation && !gender && styles.inputWrapperError]}
                            onPress={() => setShowGenderPicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="transgender-outline" size={20} color={showValidation && !gender ? "#EF4444" : "#94A3B8"} />
                            <Text style={gender ? styles.inputText : styles.placeholderText}>
                                {gender || "Select gender"}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={showValidation && !gender ? "#EF4444" : "#94A3B8"} />
                        </TouchableOpacity>
                        {showValidation && !gender && (
                            <Text style={styles.errorText}>Please select gender</Text>
                        )}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <ActivityIndicator size="small" color="#FFF" />
                            <Text style={styles.saveText}>Saving...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />
                            <Text style={styles.saveText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Date Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.dateModalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {dateStep === 'day' ? 'Select Day' :
                                    dateStep === 'month' ? 'Select Month' : 'Select Year'}
                            </Text>
                            {dateStep === 'year' ? (
                                <TouchableOpacity onPress={confirmDateSelection}>
                                    <Text style={styles.modalConfirmText}>Done</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ width: 50 }} />
                            )}
                        </View>

                        {/* Date step indicators */}
                        <View style={styles.dateStepIndicator}>
                            <TouchableOpacity
                                style={[styles.stepDot, dateStep === 'day' && styles.stepDotActive]}
                                onPress={() => setDateStep('day')}
                            >
                                <Text style={[styles.stepText, dateStep === 'day' && styles.stepTextActive]}>
                                    {selectedDay}
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.stepSeparator}>/</Text>
                            <TouchableOpacity
                                style={[styles.stepDot, dateStep === 'month' && styles.stepDotActive]}
                                onPress={() => setDateStep('month')}
                            >
                                <Text style={[styles.stepText, dateStep === 'month' && styles.stepTextActive]}>
                                    {selectedMonth + 1}
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.stepSeparator}>/</Text>
                            <TouchableOpacity
                                style={[styles.stepDot, dateStep === 'year' && styles.stepDotActive]}
                                onPress={() => setDateStep('year')}
                            >
                                <Text style={[styles.stepText, dateStep === 'year' && styles.stepTextActive]}>
                                    {selectedYear}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {renderDateStepContent()}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Gender Picker Modal */}
            <Modal
                visible={showGenderPicker}
                transparent
                animationType="slide"
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderPicker(false)}
                >
                    <View style={styles.genderModalContent}>
                        <View style={styles.genderModalHeader}>
                            <View style={styles.modalHandle} />
                        </View>
                        <Text style={styles.genderModalTitle}>Select Gender</Text>
                        {GENDER_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.genderOption,
                                    gender === option && styles.genderOptionSelected,
                                ]}
                                onPress={() => {
                                    setGender(option);
                                    setShowGenderPicker(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.genderOptionText,
                                        gender === option && styles.genderOptionTextSelected,
                                    ]}
                                >
                                    {option}
                                </Text>
                                {gender === option && (
                                    <Ionicons name="checkmark-circle" size={24} color="#5B9EE1" />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowGenderPicker(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    avatarPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
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
    inputText: {
        flex: 1,
        fontSize: 15,
        color: "#0F172A",
    },
    placeholderText: {
        flex: 1,
        fontSize: 15,
        color: "#94A3B8",
    },
    // Validation styles
    inputWrapperError: {
        borderColor: "#EF4444",
        borderWidth: 1.5,
        backgroundColor: "#FEF2F2",
    },
    errorText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 4,
        marginLeft: 4,
    },
    requiredStar: {
        color: "#EF4444",
        fontWeight: "700",
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    dateModalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 30,
        maxHeight: "70%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#0F172A",
    },
    modalCancelText: {
        fontSize: 16,
        color: "#64748B",
    },
    modalConfirmText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#5B9EE1",
    },
    // Date step indicator
    dateStepIndicator: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        gap: 8,
    },
    stepDot: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#F1F5F9",
    },
    stepDotActive: {
        backgroundColor: "#5B9EE1",
    },
    stepText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748B",
    },
    stepTextActive: {
        color: "#FFFFFF",
    },
    stepSeparator: {
        fontSize: 18,
        color: "#94A3B8",
    },
    // Date grid
    dateGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        justifyContent: "center",
        gap: 8,
    },
    dateGridItem: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
    },
    dateGridItemSelected: {
        backgroundColor: "#5B9EE1",
    },
    dateGridText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#0F172A",
    },
    dateGridTextSelected: {
        color: "#FFFFFF",
    },
    // Month grid
    monthGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        justifyContent: "center",
        gap: 8,
    },
    monthGridItem: {
        width: "30%",
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
    },
    monthGridItemSelected: {
        backgroundColor: "#5B9EE1",
    },
    monthGridText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#0F172A",
    },
    monthGridTextSelected: {
        color: "#FFFFFF",
    },
    // Year scroll
    yearScroll: {
        maxHeight: 300,
        paddingHorizontal: 20,
    },
    yearItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: "#F8FAFC",
    },
    yearItemSelected: {
        backgroundColor: "#EBF5FF",
        borderWidth: 1,
        borderColor: "#5B9EE1",
    },
    yearText: {
        fontSize: 16,
        color: "#0F172A",
    },
    yearTextSelected: {
        fontWeight: "600",
        color: "#5B9EE1",
    },
    // Gender modal styles
    genderModalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    genderModalHeader: {
        alignItems: "center",
        paddingVertical: 12,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#E2E8F0",
        borderRadius: 2,
    },
    genderModalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
        marginVertical: 16,
    },
    genderOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: "#F8FAFC",
    },
    genderOptionSelected: {
        backgroundColor: "#EBF5FF",
        borderWidth: 1,
        borderColor: "#5B9EE1",
    },
    genderOptionText: {
        fontSize: 16,
        color: "#0F172A",
    },
    genderOptionTextSelected: {
        fontWeight: "600",
        color: "#5B9EE1",
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        color: "#64748B",
        fontWeight: "500",
    },
});
