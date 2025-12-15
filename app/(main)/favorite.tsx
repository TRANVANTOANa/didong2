import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScaledSize,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function FavoriteScreen(): React.JSX.Element {
    const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const { width } = dimensions;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Text style={[styles.title, { fontSize: width * 0.07 }]}>
                Favorite
            </Text>
            <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>
                Your favorite shoes will appear here
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        color: '#1A2530',
        marginBottom: 10,
    },
    subtitle: {
        color: '#778899',
        textAlign: 'center',
    },
});
