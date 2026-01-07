import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { auth } from '../../firebase/firebaseConfig';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // ⏱ Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResetPassword = async () => {
    if (cooldown > 0) {
      Alert.alert('Thông báo', `Vui lòng chờ ${cooldown}s để thử lại`);
      return;
    }

    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      setCooldown(60); // ⏳ 60 giây chống spam

      Alert.alert(
        'Thành công',
        `Email khôi phục mật khẩu đã được gửi đến ${email.trim()}.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.log('RESET PASSWORD ERROR:', error.code);

      let message = 'Không thể gửi email khôi phục mật khẩu';

      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Email này chưa được đăng ký';
          break;
        case 'auth/invalid-email':
          message = 'Địa chỉ email không hợp lệ';
          break;
        case 'auth/too-many-requests':
          message = 'Bạn gửi quá nhiều lần. Vui lòng thử lại sau vài phút';
          setCooldown(60);
          break;
        case 'auth/network-request-failed':
          message = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet';
          break;
      }

      Alert.alert('Lỗi', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: width * 0.06 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          style={{ marginTop: height * 0.06, marginBottom: height * 0.03 }}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#1A2530" />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ marginBottom: height * 0.05 }}>
          <Text style={{ fontSize: width * 0.072, fontWeight: 'bold', color: '#1A2530' }}>
            Quên mật khẩu?
          </Text>
          <Text style={{ fontSize: width * 0.04, color: '#778899', marginTop: 12 }}>
            Nhập email đã đăng ký để nhận link khôi phục mật khẩu
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={{ fontSize: width * 0.038, fontWeight: '600', marginBottom: 10 }}>
              Địa chỉ Email
            </Text>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              isLoading || cooldown > 0 ? styles.buttonDisabled : null,
            ]}
            onPress={handleResetPassword}
            disabled={isLoading || cooldown > 0}
          >
            <Text style={{ color: '#fff', fontSize: width * 0.045 }}>
              {isLoading
                ? 'Đang gửi...'
                : cooldown > 0
                  ? `Chờ ${cooldown}s`
                  : 'Gửi email khôi phục'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 24, alignItems: 'center' }}
          >
            <Text style={{ color: '#5B9EE1' }}>← Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E8EAED',
  },
  continueButton: {
    backgroundColor: '#5B9EE1',
    borderRadius: 30,
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
