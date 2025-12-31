import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
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
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import { auth } from '../../firebase/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⚠️ PHẢI LÀ CLIENT ID GOOGLE THẬT
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  });

  // 🔐 LOGIN EMAIL / PASSWORD
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // ✅ LOGIN THÀNH CÔNG
      router.replace('/(main)');

    } catch (error: any) {
      console.log('LOGIN ERROR:', error.code);

      let message = 'Đăng nhập thất bại';

      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Email không tồn tại';
          break;
        case 'auth/wrong-password':
          message = 'Sai mật khẩu';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
        case 'auth/too-many-requests':
          message = 'Thử lại sau vài phút';
          break;
      }

      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  // 🔵 GOOGLE LOGIN
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication!;

      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => router.replace('/(main)'))
        .catch(err =>
          Alert.alert('Lỗi Google', err.message || 'Google login failed')
        );
    }
  }, [response]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Hello Again!</Text>

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* PASSWORD */}
        <View style={styles.passwordBox}>
          <TextInput
            placeholder="Password"
            style={{ flex: 1 }}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* GOOGLE */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Image
            source={require('../../assets/images/onboard/google.png')}
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
          <Text>Sign in with Google</Text>
        </TouchableOpacity>

        {/* REGISTER */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          style={{ marginTop: 20 }}
        >
          <Text style={{ textAlign: 'center', color: '#5B9EE1' }}>
            Chưa có tài khoản? Đăng ký
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 32 },
  input: {
    backgroundColor: '#F7F8FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  passwordBox: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: '#5B9EE1',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  googleBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
