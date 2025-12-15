import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
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

export default function LoginScreen(): React.JSX.Element {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const handleLogin = (): void => {
        // Mock login - navigate to home screen
        console.log('Login:', { email, password });
        // Navigate to home screen by replacing current route
        router.replace('/(main)');
    };

    const handleGoogleSignIn = (): void => {
        console.log('Google Sign In');
    };

    const handleRecoveryPassword = (): void => {
        router.push('/(auth)/forgot-password');
    };

    const handleSignUpNavigation = (): void => {
        router.push('/(auth)/register');
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
                        Hello Again!
                    </Text>
                    <Text style={[styles.subtitle, { fontSize: width * 0.038 }]}>
                        Welcome Back You've Been Missed!
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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

                        {/* Recovery Password Link */}
                        <TouchableOpacity
                            style={styles.recoveryLink}
                            onPress={handleRecoveryPassword}
                        >
                            <Text style={[styles.recoveryText, { fontSize: width * 0.033 }]}>
                                Recovery Password
                            </Text>
                        </TouchableOpacity>
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
                        onPress={handleLogin}
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
                            source={require('../../assets/images/onboard/google.png')}
                            style={[styles.googleIcon, { width: width * 0.05, height: width * 0.05 }]}
                        />
                        <Text style={[styles.googleButtonText, { fontSize: width * 0.038 }]}>
                            Sign in with google
                        </Text>
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View style={[styles.signUpContainer, { marginTop: height * 0.03 }]}>
                        <Text style={[styles.signUpText, { fontSize: width * 0.035 }]}>
                            Don't Have An Account?{' '}
                        </Text>
                        <TouchableOpacity onPress={handleSignUpNavigation}>
                            <Text style={[styles.signUpLink, { fontSize: width * 0.035 }]}>
                                Sign Up For Free
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
    recoveryLink: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    recoveryText: {
        color: '#778899',
        fontWeight: '500',
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
