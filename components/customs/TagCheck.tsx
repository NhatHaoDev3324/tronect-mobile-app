import { Pressable, StyleSheet, Text, View } from "react-native";

interface TagCheckProps {
    verification_status: string;
    onPress?: () => void;
}

export const TagCheck = ({ verification_status, onPress }: TagCheckProps) => {
    if (verification_status !== "verified") return null;

    const Content = (
        <View style={styles.container}>
            <Text style={styles.text}>Đã xác thực</Text>
        </View>
    );

    if (onPress) {
        return (
            <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]} accessibilityRole="button">
                {Content}
            </Pressable>
        );
    }

    return Content;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2baf90",
        paddingRight: 6,
        paddingLeft: 4,
        paddingVertical: 2,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    text: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
        marginLeft: 4,
    },
    pressed: {
        opacity: 0.85,
    },
});

export default TagCheck;
