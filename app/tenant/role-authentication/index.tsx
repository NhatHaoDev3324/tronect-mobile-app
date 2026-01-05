import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Register() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>Đăng ký</Text>
      <Text style={{ marginTop: 8, opacity: 0.7 }}>Màn hình demo</Text>

      <Link href="/tenant/login" asChild>
        <Pressable style={{ marginTop: 14 }}>
          <Text style={{ color: "#3B82F6", fontWeight: "800" }}>Về đăng nhập</Text>
        </Pressable>
      </Link>
    </View>
  );
}
