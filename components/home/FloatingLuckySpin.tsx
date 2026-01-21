import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FloatingLuckySpin() {
    const router = useRouter();
    const [visible, setVisible] = useState(true);

    // Animation values
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();

        // Shaking loop animation
        const shakeLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
                Animated.delay(2000), // Wait 2s before shaking again
            ])
        );
        shakeLoop.start();

        return () => shakeLoop.stop();
    }, []);

    const handlePress = () => {
        router.push('/account/lucky-spin');
    };

    const handleClose = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { scale: scaleAnim },
                        {
                            rotate: shakeAnim.interpolate({
                                inputRange: [-10, 10],
                                outputRange: ['-10deg', '10deg']
                            })
                        }
                    ],
                },
            ]}
        >
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={12} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                <View style={styles.envelope}>
                    <View style={styles.topFlap} />
                    <Text style={styles.luckText}>Lắc Xì</Text>
                    <Text style={styles.subText}>100% Trúng</Text>
                    <View style={styles.coin}>
                        <Text style={styles.coinText}>$</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    envelope: {
        width: 80,
        height: 90,
        backgroundColor: '#DC2626', // Red
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FCD34D', // Gold border
        overflow: 'hidden',
    },
    topFlap: {
        position: 'absolute',
        top: -30,
        width: 80,
        height: 60,
        backgroundColor: '#EF4444',
        borderRadius: 40,
        transform: [{ scaleX: 1.2 }],
        borderBottomWidth: 2,
        borderColor: '#F59E0B',
    },
    luckText: {
        fontFamily: 'System', // Or custom font
        fontWeight: '900',
        color: '#FCD34D', // Gold
        fontSize: 18,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginTop: 18,
    },
    subText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 2,
        textAlign: 'center',
        backgroundColor: '#B91C1C',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    coin: {
        position: 'absolute',
        top: -10,
        width: 24,
        height: 24,
        backgroundColor: '#FCD34D',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    coinText: {
        color: '#B45309',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
