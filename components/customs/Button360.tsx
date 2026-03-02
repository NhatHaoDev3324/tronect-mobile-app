import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text } from "react-native";

interface Button360Props {
    view360?: string | null;
    onPress?: () => void;
}

export const Button360 = ({ view360, onPress }: Button360Props) => {
    if (!view360) return null;

    const isPanoeeUrl = (url: string) => {
        return url?.startsWith("https://tour.panoee.net");
    };

    const canShow = !!view360 && isPanoeeUrl(view360);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
            accessibilityRole="button"
        >
            <LinearGradient
                colors={["#3b82f6", "#7c3aed", "#a78bfa"]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.container}
            >
                <MaterialCommunityIcons name="scan-helper" size={16} color="#fff" />
                <Text style={styles.text}>Xem 360{canShow && " Tour"}</Text>
            </LinearGradient>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrap: {
        borderRadius: 999,
        overflow: "hidden",
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    pressed: {
        opacity: 0.85,
    },
    text: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
        marginLeft: 10,
    },
});

export default Button360;
