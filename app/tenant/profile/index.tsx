import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";

import noAvatar from "@/assets/images/noAvata.png";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  type ViewProps,
} from "react-native";

import Toast from "react-native-toast-message";

import { tenantMyProfile, tenantUpdateAvatar } from "@/api/authTenantApi";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { TenantInfoType } from "@/types/authType";
import { getGenderName } from "@/types/genderName";
import { formatDateOnly } from "@/utils/formatDateTime";
import { Image } from "expo-image";
import { router } from "expo-router";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function Profile({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { userID, urlImg } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [info, setInfo] = useState<TenantInfoType>({} as TenantInfoType);
  const setUrlImg = useAuthStore((s) => s.setUrlImg);

  useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const res = await tenantMyProfile();
      setInfo(res.data);
      setUrlImg(res.data.picture);
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: e?.message ?? "Không thể làm mới dữ liệu",
        position: "top",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const pickAndUploadAvatar = async () => {
    if (!userID) {
      Toast.show({
        type: "error",
        text1: "Bạn chưa đăng nhập",
        text2: "Vui lòng đăng nhập để đổi ảnh đại diện.",
        position: "top",
      });
      return;
    }

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Không có quyền",
          text2: "Vui lòng cho phép truy cập thư viện ảnh.",
          position: "top",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const uri = asset.uri;
      const filename = uri.split("/").pop() || "avatar.jpg";
      const ext = filename.split(".").pop()?.toLowerCase();
      const type =
        ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "image/*";

      const formData = new FormData();
      formData.append("picture", { uri, name: filename, type } as any);

      setUploading(true);

      const res = await tenantUpdateAvatar(formData);

      const tenant = res?.data ?? res;

      const newUrl =
        tenant?.urlImg ||
        tenant?.picture ||
        tenant?.avatar ||
        tenant?.image ||
        tenant?.url;

      if (newUrl && typeof setUrlImg === "function") {
        setUrlImg(newUrl);
      }

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: res?.message ?? "Đã cập nhật ảnh đại diện.",
        position: "top",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Cập nhật ảnh đại diện thất bại.";

      Toast.show({ type: "error", text1: "Lỗi", text2: msg, position: "top" });
    } finally {
      setUploading(false);
    }
  };

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor }}
      refreshControl={
        <RefreshControl
          progressViewOffset={40}
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2baf90"
          colors={["#2baf90"]}
        />
      }
    >
      <ThemedView className="flex flex-row gap-4 items-center mt-8 mb-2 px-4">
        <ThemedView
          style={{
            position: "relative",
            width: 68,
            height: 68,
            marginBottom: 12,
          }}
        >
          <Pressable onPress={pickAndUploadAvatar} disabled={uploading}>
            <Image
              source={userID ? (urlImg ? urlImg : noAvatar) : noAvatar}
              style={{ width: 68, height: 68, borderRadius: 999 }}
              contentFit="cover"
            />

            {uploading && (
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </Pressable>

          {/* nút edit */}
          <Pressable
            onPress={pickAndUploadAvatar}
            disabled={uploading}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              borderRadius: 16,
              backgroundColor: "#000",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#fff",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <Feather name="edit-2" size={12} color="#fff" />
          </Pressable>
        </ThemedView>
        <ThemedView className="flex-col">
          <ThemedText type="subtitle">
            {userID ? info?.username : "Không xác định"}
          </ThemedText>
          <ThemedText style={{ color: "gray", fontSize: 14 }}>
            Tham gia ngày:{" "}
            {userID ? formatDateOnly(info?.created_at) : "Không xác định"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView className="flex flex-col gap-2 px-4">
        <Textarea
          readOnly
          value={info?.bio || "Chưa có thông tin mô tả cá nhân."}
          className="h-20"
        />

        <ThemedView className="rounded-xl border border-border divide-y px-4 py-2">
          <ThemedView className="flex-row py-2 rounded-xl">
            <Text className="w-28 text-muted-foreground">Họ và tên:</Text>
            <Text className="flex-1 text-base font-medium">
              {info?.username ?? "Không xác định"}
            </Text>
          </ThemedView>

          <ThemedView className="flex-row py-2 rounded-xl">
            <Text className="w-28 text-muted-foreground">Email:</Text>
            <Text className="flex-1 text-base font-medium">
              {info?.email ?? "Không xác định"}
            </Text>
          </ThemedView>

          <ThemedView className="flex-row py-2 rounded-xl">
            <Text className="w-28 text-muted-foreground">Số điện thoại:</Text>
            <Text className="flex-1 text-base font-medium">
              {info?.phone ?? "Không xác định"}
            </Text>
          </ThemedView>

          <ThemedView className="flex-row py-2 rounded-xl">
            <Text className="w-28 text-muted-foreground">Giới tính:</Text>
            <Text className="flex-1 text-base font-medium">
              {getGenderName(info?.gender)}
            </Text>
          </ThemedView>

          <ThemedView className="flex-row py-2 rounded-xl">
            <Text className="w-28 text-muted-foreground">Ngày sinh:</Text>
            <Text className="flex-1 text-base font-medium">
              {formatDateOnly(info?.date_of_birth) ?? "Không xác định"}
            </Text>
          </ThemedView>

          <ThemedView className="flex-row py-2 rounded-xl">
            <Text className="w-28 text-muted-foreground">Số Zalo:</Text>
            <Text className="flex-1 text-base font-medium">
              {info?.zalo !== null ? info?.zalo : "Chưa cung cấp"}
            </Text>
          </ThemedView>
        </ThemedView>
        <Pressable
          onPress={() => {
            router.push("/tenant/edit-profile");
          }}
        >
          <Text
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#2baf90",
              marginTop: 1,
              color: "#2baf90",
              fontSize: 15,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Chỉnh sửa thông tin cá nhân
          </Text>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}
