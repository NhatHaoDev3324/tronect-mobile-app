import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet } from "react-native";

export default function CustomSplash({ onFinish }: { onFinish: () => void }) {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start(onFinish);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity }]}>
            <Image
                source={require("../../assets/images/splash-icon.png")}
                style={styles.logo}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 140,
        height: 140,
    },
});
