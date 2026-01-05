import noAvatar from "@/assets/images/noAvata.png";
import { DividerCustom } from "@/components/customs/DividerCustom";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDateOnly } from "@/utils/formatDateTime";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, type ViewProps } from "react-native";
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
  {
    key: "change-password",
    label: "Đổi mật khẩu",
    icon: "lock",
    onPress: () => console.log("Đổi mật khẩu"),
  },
  {
    key: "appearance",
    label: "Hiển thị",
    icon: "monitor",
    onPress: () => console.log("Giao diện"),
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

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function SearchScreen({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const { userName, urlImg, created, userID } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  const confirmLogout = async () => {
    setLogoutOpen(false);
    await useAuthStore.getState().reset();
    router.replace("/tenant/(tabs)");
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex flex-col items-center mt-24 mb-4">
        <ThemedView
          style={{
            position: "relative",
            width: 100,
            height: 100,
            marginBottom: 12,
          }}
        >
          <Image
            source={userID ? urlImg : noAvatar}
            style={{ width: 100, height: 100, borderRadius: 999 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => {
              router.push("/tenant/login");
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
          {userID ? userName : "Không xác định"}
        </ThemedText>
        <ThemedText style={{ color: "gray", fontSize: 14 }}>
          Tham gia ngày: {userID ? formatDateOnly(created) : "Không xác định"}
        </ThemedText>
      </ThemedView>

      <ThemedView>
        <ThemedText
          className="px-4 "
          style={[
            !userID ? { display: "none" } : undefined,
            { color: "gray", fontSize: 14, fontWeight: "bold" },
          ]}
        >
          Tài khoản
        </ThemedText>
        <ThemedView
          style={[
            !userID ? { display: "none" } : undefined,
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

        <DividerCustom />

        <ThemedView>
          <ThemedText
            className="mt-4 px-4"
            style={{ color: "gray", fontSize: 14, fontWeight: "bold" }}
          >
            Hướng dẫn
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

          <DividerCustom />

          <ThemedView className="mt-2">
            <Pressable
              onPress={() => {
                if (userID) setLogoutOpen(true);
                else router.push("/tenant/login");
              }}
              android_ripple={{ color: "#EF444420" }}
              style={[
                { backgroundColor },
                {
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                },
              ]}
            >
              <Feather
                name={userID ? "log-out" : "log-in"}
                size={20}
                color={userID ? "#EF4444" : "#8E8E93"}
              />

              <ThemedText
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  fontWeight: userID ? "600" : "400",
                }}
              >
                {userID ? "Đăng xuất" : "Đăng nhập"}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onPress={confirmLogout}>
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
