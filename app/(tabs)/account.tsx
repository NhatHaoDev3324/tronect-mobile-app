import Avatar from "@/assets/images/trump.png";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};
export default function SearchScreen({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const accountMenus = [
    {
      key: "profile",
      label: "Hồ sơ của tôi",
      icon: "user",
      onPress: () => console.log("Hồ sơ của tôi"),
    },
    {
      key: "manage-posts",
      label: "Quản lý bài đăng",
      icon: "file-text",
      onPress: () => console.log("Quản lý bài đăng"),
    },
    {
      key: "saved-posts",
      label: "Tin đăng đã lưu",
      icon: "heart",
      onPress: () => console.log("Tin đăng đã lưu"),
    },
  ] as const;

  const otherMenus = [
    {
      key: "support",
      label: "Hỗ trợ khách hàng",
      icon: "headphones",
      onPress: () => console.log("Hỗ trợ khách hàng"),
    },
    {
      key: "faq",
      label: "Câu hỏi thường gặp",
      icon: "help-circle",
      onPress: () => console.log("Câu hỏi thường gặp"),
    },
  ] as const;
  return (
    <ThemedView className="flex-1 px-4 ">
      <ThemedView className="flex flex-col items-center mt-28 mb-8">
        <ThemedView
          style={{
            position: "relative",
            width: 100,
            height: 100,
            marginBottom: 12,
          }}
        >
          <Image
            source={Avatar}
            style={{ width: 100, height: 100, borderRadius: 999 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => {
              console.log("Edit avatar");
            }}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#000",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#fff",
            }}
          >
            <Feather name="edit-2" size={16} color="#fff" />
          </Pressable>
        </ThemedView>
        <ThemedText type="subtitle" style={{ marginBottom: 4 }}>
          Nguyễn Nhật Hào
        </ThemedText>
        <ThemedText style={{ color: "gray", fontSize: 14 }}>
          Tham gia ngày: 03/03/2025
        </ThemedText>
      </ThemedView>

      <ThemedView>
        <ThemedText style={{ color: "gray", fontSize: 14, fontWeight: "bold" }}>
          Tài khoản
        </ThemedText>
        <ThemedView
          style={[
            { backgroundColor },
            {
              borderRadius: 16,
              paddingVertical: 4,
            },
          ]}
        >
          {accountMenus.map((item) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={[
                { backgroundColor },
                {
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                },
              ]}
            >
              <Feather name={item.icon} size={20} color="#8E8E93" />

              <ThemedText style={{ flex: 1, marginLeft: 12, fontSize: 16 }}>
                {item.label}
              </ThemedText>

              <Feather name="chevron-right" size={20} color="#C7C7CC" />
            </Pressable>
          ))}
        </ThemedView>

        <ThemedView>
          <ThemedText
            style={{ color: "gray", fontSize: 14, fontWeight: "bold" }}
          >
            Khác
          </ThemedText>
          <ThemedView
            style={[
              { backgroundColor },
              {
                borderRadius: 16,
                paddingVertical: 4,
              },
            ]}
          >
            {otherMenus.map((item) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={[
                  { backgroundColor },
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                  },
                ]}
              >
                <Feather name={item.icon} size={20} color="#8E8E93" />

                <ThemedText style={{ flex: 1, marginLeft: 12, fontSize: 16 }}>
                  {item.label}
                </ThemedText>

                <Feather name="chevron-right" size={20} color="#C7C7CC" />
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
