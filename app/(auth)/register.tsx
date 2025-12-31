import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScaledSize,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

export default function RegisterScreen(): React.JSX.Element {
  const router = useRouter();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window')
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }: { window: ScaledSize }) => {
        setDimensions(window);
      }
    );
    return () => subscription?.remove();
  }, []);

  // 🔐 REGISTER
  const handleRegister = async (): Promise<void> => {
    if (!name || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      Alert.alert('Thành công', 'Đăng ký thành công');
      router.replace('/(auth)/login');

    } catch (error: any) {
      console.log('REGISTER ERROR:', error.code);

      let message = 'Đăng ký thất bại';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email đã được sử dụng';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
        case 'auth/weak-password':
          message = 'Mật khẩu quá yếu';
          break;
      }

      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = (): void => {
    Alert.alert('Thông báo', 'Google Sign In sẽ làm sau');
  };

  const handleSignInNavigation = (): void => {
    router.push('/(auth)/login');
  };

  const { width, height } = dimensions;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: width * 0.06 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BACK */}
        <TouchableOpacity
          style={[styles.backButton, { marginTop: height * 0.06 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1A2530" />
        </TouchableOpacity>

        {/* HEADER */}
        <View style={{ marginBottom: height * 0.05 }}>
          <Text style={[styles.title, { fontSize: width * 0.07 }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { fontSize: width * 0.038 }]}>
            Let's Create Account Together
          </Text>
        </View>

        {/* FORM */}
        <View>
          {/* NAME */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Alison Becker"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="email@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#707B81"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* REGISTER BTN */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'ĐANG ĐĂNG KÝ...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* GOOGLE */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Image
              source={require('../../assets/images/onboard/google.png')}
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.googleButtonText}>
              Sign in with Google
            </Text>
          </TouchableOpacity>

          {/* LOGIN */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              Already Have An Account?
            </Text>
            <TouchableOpacity onPress={handleSignInNavigation}>
              <Text style={styles.signUpLink}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  backButton: { width: 40, height: 40 },
  title: { fontWeight: 'bold', color: '#1A2530' },
  subtitle: { color: '#778899' },
  inputContainer: { marginBottom: 20 },
  label: { fontWeight: '500', marginBottom: 8 },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  passwordInput: { flex: 1 },
  signInButton: {
    backgroundColor: '#5B9EE1',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
  },
  googleButtonText: { marginLeft: 10 },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: { color: '#778899' },
  signUpLink: { color: '#5B9EE1', fontWeight: '600' },
});
