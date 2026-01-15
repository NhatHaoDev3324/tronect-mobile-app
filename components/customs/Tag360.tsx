import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text } from "react-native";

interface Tag360Props {
    picture_360?: string | null;
    onPress?: () => void;
}

export const Tag360 = ({ picture_360, onPress }: Tag360Props) => {
    if (!picture_360) return null;

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
                <MaterialCommunityIcons name="scan-helper" size={12} color="#fff" />
                <Text style={styles.text}>360</Text>
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
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
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
        fontSize: 12,
        marginLeft: 6,
    },
});

export default Tag360;
