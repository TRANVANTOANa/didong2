import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Onboarding1() {
    const router = useRouter();
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const { width, height } = dimensions;

    const handleGetStarted = () => {
        router.push('/onboarding/onboarding2');
    };

    const handleSkip = () => {
        router.push('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Skip Button */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Decorative dots - positioned exactly like the reference image */}
            <View style={styles.decorativeDots}>
                {/* Top left small dot */}
                <View style={[styles.dotSmall, { top: height * 0.08, left: width * 0.08 }]} />

                {/* Top center area - light background bubble */}
                <View style={[styles.backgroundBubble, {
                    top: height * 0.02,
                    right: width * 0.15,
                    width: width * 0.35,
                    height: height * 0.18,
                }]} />

                {/* Right side dot */}
                <View style={[styles.dotSmall, { top: height * 0.35, right: width * 0.08 }]} />
            </View>

            {/* Shoe Image - centered and prominent */}
            <View style={[styles.imageContainer, {
                height: height * 0.48,
                marginTop: height * 0.08,
            }]}>
                <Image
                    source={require('../../assets/images/onboard/onboard-1.png')}

                    style={[styles.shoeImage, {
                        width: width * 0.75,
                        height: '100%',
                    }]}
                    resizeMode="contain"
                />
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                <Text style={styles.title}>Start Journey{'\n'}With Nike</Text>
                <Text style={styles.subtitle}>
                    Smart, Gorgeous & Fashionable{'\n'}Collection
                </Text>
            </View>

            {/* Pagination Indicator - single line */}
            <View style={styles.paginationContainer}>
                <View style={styles.paginationLine} />
            </View>

            {/* Get Started Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={handleGetStarted}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    decorativeDots: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    dotSmall: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#5B9EE1',
        opacity: 0.4,
        position: 'absolute',
    },
    backgroundBubble: {
        position: 'absolute',
        backgroundColor: '#E8F1F8',
        borderRadius: 100,
        opacity: 0.3,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    shoeImage: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    content: {
        paddingHorizontal: 40,
        marginTop: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0D1B2A',
        lineHeight: 40,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#778899',
        lineHeight: 22,
        fontWeight: '400',
    },
    paginationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        marginBottom: 10,
    },
    paginationLine: {
        width: 40,
        height: 3,
        backgroundColor: '#5B9EE1',
        borderRadius: 2,
    },
    buttonContainer: {
        paddingHorizontal: 40,
        marginTop: 30,
        marginBottom: 40,
    },
    getStartedButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 25,
        backgroundColor: '#5B9EE1',
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
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 25,
        paddingHorizontal: 20,
        paddingVertical: 8,
        zIndex: 10,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5B9EE1',
    },
});
