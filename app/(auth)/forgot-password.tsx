import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Giả lập gửi OTP
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'A verification code has been sent to your email.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Đảm bảo 100% đúng route khi file là app/(tabs)/otp.tsx
              router.push('/(auth)/otp');
            },
          },
        ],
        { cancelable: false }
      );
    }, 1200);
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={{ marginTop: height * 0.06, marginBottom: height * 0.03 }}
          onPress={() => router.back()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1A2530" />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ marginBottom: height * 0.05 }}>
          <Text style={{ fontSize: width * 0.072, fontWeight: 'bold', color: '#1A2530' }}>
            Recovery Password
          </Text>
          <Text
            style={{
              fontSize: width * 0.04,
              color: '#778899',
              marginTop: 12,
              lineHeight: 22,
            }}
          >
            Please enter your email address to{'\n'}
            receive a verification code
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={{ fontSize: width * 0.038, fontWeight: '600', color: '#1A2530', marginBottom: 10 }}>
              Email Address
            </Text>
            <TextInput
              style={{
                backgroundColor: '#F7F8FA',
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: height * 0.022,
                fontSize: width * 0.042,
                color: '#1A2530',
                borderWidth: 1.5,
                borderColor: '#E8EAED',
              }}
              placeholder="example@gmail.com"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              { paddingVertical: height * 0.022, marginTop: height * 0.03 },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: width * 0.045, fontWeight: '600', color: '#FFFFFF' }}>
              {isLoading ? 'Sending...' : 'Continue'}
            </Text>
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
  continueButton: {
    backgroundColor: '#5B9EE1',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B9EE1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});