import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const handleContinue = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Success',
                'A verification code has been sent to your email address.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            console.log('Navigate to verification screen');
                            router.back();
                        },
                    },
                ]
            );
        }, 1500);
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
                        Recovery Password
                    </Text>
<Text style={[styles.subtitle, { fontSize: width * 0.038 }]}>
                        Please Enter Your Email Address To{'\n'}Receive a Verification Code
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
                            editable={!isLoading}
                        />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            {
                                paddingVertical: height * 0.02,
                                marginTop: height * 0.02,
                            },
                            isLoading && styles.buttonDisabled
                        ]}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Text style={[styles.continueButtonText, { fontSize: width * 0.04 }]}>
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
        marginBottom: 12,
    },
    subtitle: {
        color: '#778899',
        fontWeight: '400',
        lineHeight: 22,
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
    continueButton: {
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
    continueButtonText: {
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
