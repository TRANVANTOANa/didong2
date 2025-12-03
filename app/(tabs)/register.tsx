import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Dimensions,
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

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const handleRegister = () => {
    console.log('Register:', { name, email, password });
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In');
  };

  const handleSignInNavigation = () => {
    router.push('/(tabs)/login');
  };

  const { width, height } = dimensions;
  const isLandscape = width > height;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: width * 0.06 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { marginTop: height * 0.06 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1A2530" />
        </TouchableOpacity>

        {/* Header */}
        <View style={[styles.header, { marginBottom: height * 0.05 }]}>
          <Text style={[styles.title, { fontSize: width * 0.07 }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { fontSize: width * 0.038 }]}>
            Let's Create Account Together
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { fontSize: width * 0.035 }]}>
              Your Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  paddingVertical: height * 0.02,
                  fontSize: width * 0.038,
                }
              ]}
              placeholder="Alison Becker"
              placeholderTextColor="#B0B0B0"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
<View style={styles.inputContainer}>
            <Text style={[styles.label, { fontSize: width * 0.035 }]}>
              Email Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  paddingVertical: height * 0.02,
                  fontSize: width * 0.038,
                }
              ]}
              placeholder="alisonbecker@gmail.com"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { fontSize: width * 0.035 }]}>
              Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    paddingVertical: height * 0.02,
                    fontSize: width * 0.038,
                  }
                ]}
                placeholder="••••••••"
                placeholderTextColor="#B0B0B0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
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

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              {
                paddingVertical: height * 0.02,
                marginTop: height * 0.02,
              }
            ]}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={[styles.signInButtonText, { fontSize: width * 0.04 }]}>
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                paddingVertical: height * 0.02,
                marginTop: height * 0.02,
              }
            ]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/google.png')}
              style={[styles.googleIcon, { width: width * 0.05, height: width * 0.05 }]}
            />
            <Text style={[styles.googleButtonText, { fontSize: width * 0.038 }]}>
Sign in with google
            </Text>
          </TouchableOpacity>

          {/* Already Have Account */}
          <View style={[styles.signUpContainer, { marginTop: height * 0.03 }]}>
            <Text style={[styles.signUpText, { fontSize: width * 0.035 }]}>
              Already Have An Account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignInNavigation}>
              <Text style={[styles.signUpLink, { fontSize: width * 0.035 }]}>
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    marginBottom: 10,
    justifyContent: 'center',
  },
  header: {
  },
  title: {
    fontWeight: 'bold',
    color: '#1A2530',
    marginBottom: 8,
  },
  subtitle: {
    color: '#778899',
    fontWeight: '400',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '500',
    color: '#1A2530',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#1A2530',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#1A2530',
  },
  eyeIcon: {
    padding: 16,
  },
  signInButton: {
    backgroundColor: '#5B9EE1',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B9EE1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signInButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  googleIcon: {
    resizeMode: 'contain',
  },
  googleButtonText: {
    fontWeight: '500',
    color: '#1A2530',
    marginLeft: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#778899',
  },
  signUpLink: {
    fontWeight: '600',
    color: '#5B9EE1',
  },
});