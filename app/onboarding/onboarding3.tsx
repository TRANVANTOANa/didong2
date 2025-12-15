import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function Onboarding3() {
    const router = useRouter();
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const { width, height } = dimensions;

    const handleNext = () => {
        router.push('/(auth)/login');
    };

    const handleBack = () => {
        router.back();
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

            {/* Decorative dots */}
            <View style={styles.decorativeDots}>
                <View style={[styles.dot, { top: height * 0.15, left: 30 }]} />
                <View style={[styles.dot, { top: height * 0.12, right: width * 0.35 }]} />
                <View style={[styles.dot, { top: height * 0.42, left: 25 }]} />
                <View style={[styles.dot, { top: height * 0.4, right: 30 }]} />
            </View>

            {/* Shoe Image */}
            <View style={[styles.imageContainer, { height: height * 0.45 }]}>
                <Image
                    source={require('../../assets/images/onboard/onboard-3.png')}
                    style={[styles.shoeImage, { width: width * 0.85 }]}
                    resizeMode="contain"
                />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Summer Shoes{'\n'}Nike 2022</Text>
                <Text style={styles.subtitle}>Amet Minim Lit Nodeseru Saku{'\n'}Nandu sit Alique Dolor</Text>
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                <View style={styles.paginationDot} />
                <View style={styles.paginationDot} />
                <View style={[styles.paginationDot, styles.paginationDotActive]} />
            </View>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F9',
    },
    decorativeDots: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#5B9EE1',
        opacity: 0.3,
        position: 'absolute',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    shoeImage: {
        height: '100%',
    },
    content: {
        paddingHorizontal: 30,
        marginTop: 30,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1A2530',
        lineHeight: 44,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#707B81',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    paginationDot: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#5B9EE1',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: 30,
        gap: 15,
    },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        backgroundColor: '#E5E7EB',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A2530',
    },
    nextButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        backgroundColor: '#5B9EE1',
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
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
