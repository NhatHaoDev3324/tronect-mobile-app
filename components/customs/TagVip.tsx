import { Star } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TagVipProps {
  postType: string;
  onPress?: () => void;
}

export const TagVip = ({ postType, onPress }: TagVipProps) => {
  if (postType !== "vip") return null;

  const Content = (
    <View style={styles.container}>
      <Star size={14} color="#fbbf24" />
      <Text style={styles.text}>Tin VIP nổi bật</Text>
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
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default TagVip;
