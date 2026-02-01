import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";

import noAvatar from "@/assets/images/noAvata.png";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  type ViewProps,
} from "react-native";
import Toast from "react-native-toast-message";

import {
  tenantMyProfile,
  tenantUpdate,
  tenantUpdateAvatar,
} from "@/api/authTenantApi";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { GenderType, TenantInfoType } from "@/types/authType";
import { formatDateOnly } from "@/utils/formatDateTime";
import { Image } from "expo-image";
import { router } from "expo-router";

const asGender = (g: any): GenderType => {
  const s = String(g ?? "").trim();
  const allowed: GenderType[] = [
    "male",
    "female",
    "gay",
    "les",
    "other",
    "no_share",
    "not_provided",
  ];
  return (allowed as string[]).includes(s) ? (s as GenderType) : "not_provided";
};

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function EditProfile({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { userID, urlImg } = useAuthStore();
  const setUrlImg = useAuthStore((s) => s.setUrlImg);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [info, setInfo] = useState<TenantInfoType>({} as TenantInfoType);

  const [data, setData] = useState<
    Partial<TenantInfoType> & { gender: GenderType }
  >({
    gender: "not_provided",
  });

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [dobDate, setDobDate] = useState<Date | null>(null);

  useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backgroundColor = useThemeColor(
    { light: lightColor ?? "#fff", dark: darkColor ?? "#000" },
    "background"
  );

  const textColor = useThemeColor(
    { light: lightColor ?? "#000", dark: darkColor ?? "#fff" },
    "text"
  );

  const hydrateForm = (tenant: TenantInfoType) => {
    setInfo(tenant);

    const next: Partial<TenantInfoType> = {
      username: (tenant as any)?.username ?? "",
      email: (tenant as any)?.email ?? "",
      phone: (tenant as any)?.phone ?? "",
      zalo: (tenant as any)?.zalo ?? "",
      bio: (tenant as any)?.bio ?? "",
      gender: asGender((tenant as any)?.gender),
      date_of_birth: (tenant as any)?.date_of_birth ?? undefined,
      picture: (tenant as any)?.picture,
      created_at: (tenant as any)?.created_at,
      role: (tenant as any)?.role,
    };

    setData(next as TenantInfoType);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await tenantMyProfile();
      const tenant = res.data;

      setUrlImg((tenant as any)?.picture);
      hydrateForm(tenant);
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

      const tenant = (res as any)?.data ?? res;
      const newUrl =
        tenant?.picture || tenant?.avatar || tenant?.image || tenant?.url;

      if (newUrl) setUrlImg(newUrl);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: (res as any)?.message ?? "Đã cập nhật ảnh đại diện.",
        position: "top",
      });

      await onRefresh();
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

  const validate = () => {
    if (!String(data.username ?? "").trim()) return "Vui lòng nhập họ và tên.";
    const phone = String(data.phone ?? "");
    const zalo = String(data.zalo ?? "");
    if (phone && phone.replace(/\D/g, "").length < 8)
      return "Số điện thoại không hợp lệ.";
    if (zalo && zalo.replace(/\D/g, "").length < 8)
      return "Số Zalo không hợp lệ.";
    return "";
  };

  const handleCancel = () => {
    router.replace("/tenant/profile");
  };

  const onSave = async () => {
    if (!userID) {
      Toast.show({
        type: "error",
        text1: "Bạn chưa đăng nhập",
        text2: "Vui lòng đăng nhập để chỉnh sửa hồ sơ.",
        position: "top",
      });
      return;
    }

    const err = validate();
    if (err) {
      Toast.show({ type: "error", text1: "Lỗi", text2: err, position: "top" });
      return;
    }

    try {
      setSaving(true);

      await tenantUpdate(
        String(data.username ?? "").trim(),
        String(data.email ?? "").trim(),
        String(data.phone ?? "").trim(),
        data.gender,
        data.date_of_birth as Date | undefined,
        String(data.bio ?? "").trim(),
        String(data.zalo ?? "").trim()
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã cập nhật hồ sơ.",
        position: "top",
      });

      router.replace("/tenant/profile");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Cập nhật hồ sơ thất bại.";
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: msg,
        position: "top",
      });
    } finally {
      setSaving(false);
    }
  };

  const Row = ({
    label,
    children,
    showDivider = true,
  }: {
    label: string;
    children: React.ReactNode;
    showDivider?: boolean;
  }) => (
    <ThemedView
      className={`flex-row py-3 ${showDivider ? "border-b border-border" : ""}`}
    >
      <Text className="w-24 text-muted-foreground">{label}</Text>
      <ThemedView className="flex-1">{children}</ThemedView>
    </ThemedView>
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
      contentContainerStyle={{ paddingBottom: 28 }}
    >
      {/* Header */}

      <ThemedView className="flex flex-row gap-4 items-center pt-8 pb-2 px-4">
        <ThemedView
          style={{
            position: "relative",
            width: 68,
            height: 68,
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

      <ThemedView className="h-full px-4 pt-4">
        <ThemedView className="rounded-xl border border-border p-4">
          {/* Bio */}
          <ThemedView className="mb-3">
            <Text className="text-sm text-muted-foreground mb-2">Bio</Text>
            <Textarea
              value={String(data.bio ?? "")}
              onChangeText={(t: string) => setData((p) => ({ ...p, bio: t }))}
              editable={true as any}
              className="h-24"
              placeholder="Nhập Bio của bạn"
            />
          </ThemedView>

          {/* Bảng */}
          <ThemedView className="rounded-xl border border-border px-4">
            <Row label="Họ và tên:">
              <Input
                value={String(data.username ?? "")}
                onChangeText={(t: string) =>
                  setData((p) => ({ ...p, username: t }))
                }
                placeholder="Nhập tên của bạn"
              />
            </Row>

            <Row label="Email:">
              <Input
                value={String(data.email ?? "")}
                onChangeText={(t: string) =>
                  setData((p) => ({ ...p, email: t }))
                }
                placeholder="Nhập Email của bạn"
              />
            </Row>

            <Row label="SĐT:">
              <Input
                value={String(data.phone ?? "")}
                onChangeText={(t: string) =>
                  setData((p) => ({ ...p, phone: t }))
                }
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
            </Row>

            <Row label="Giới tính:">
              <ThemedView
                style={{
                  height: 36,
                  display: "flex",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#D0D5DD",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={data.gender}
                  style={{ color: textColor }}
                  onValueChange={(value) =>
                    setData((p) => ({
                      ...p,
                      gender: value as GenderType,
                    }))
                  }
                >
                  <Picker.Item label="Nam" value="male" />
                  <Picker.Item label="Nữ" value="female" />
                  <Picker.Item label="Đồng tính nam" value="gay" />
                  <Picker.Item label="Đồng tính nữ" value="les" />
                  <Picker.Item label="Khác" value="other" />
                  <Picker.Item label="Không muốn chia sẻ" value="no_share" />
                </Picker>
              </ThemedView>
            </Row>

            <Row label="Ngày sinh:">
              <Pressable
                onPress={() => setShowDobPicker(true)}
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: "#D0D5DD",
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  backgroundColor: pressed ? "rgba(0,0,0,0.03)" : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                })}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: textColor,
                  }}
                >
                  {data.date_of_birth
                    ? formatDateOnly(data.date_of_birth as any)
                    : "Chọn ngày sinh"}
                </Text>
              </Pressable>

              {Platform.OS === "android" && showDobPicker && (
                <DateTimePicker
                  value={dobDate ?? new Date(2000, 0, 1)}
                  mode="date"
                  display="calendar"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    if (event.type === "dismissed") {
                      setShowDobPicker(false);
                      return;
                    }
                    if (selectedDate) {
                      setDobDate(selectedDate);
                      setData((p) => ({
                        ...p,
                        date_of_birth: selectedDate as any,
                      }));
                    }
                    setShowDobPicker(false);
                  }}
                />
              )}

              {Platform.OS === "ios" && (
                <Modal visible={showDobPicker} transparent animationType="fade">
                  <Pressable
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.35)",
                      justifyContent: "flex-end",
                    }}
                    onPress={() => setShowDobPicker(false)}
                  >
                    <Pressable
                      style={{
                        backgroundColor: "#fff",
                        padding: 12,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                      onPress={() => { }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Pressable onPress={() => setShowDobPicker(false)}>
                          <Text style={{ fontWeight: "700" }}>Xong</Text>
                        </Pressable>
                      </View>

                      <DateTimePicker
                        value={dobDate ?? new Date(2000, 0, 1)}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={(_, selectedDate) => {
                          if (selectedDate) {
                            setDobDate(selectedDate);
                            setData((p) => ({
                              ...p,
                              date_of_birth: selectedDate as any,
                            }));
                          }
                        }}
                      />
                    </Pressable>
                  </Pressable>
                </Modal>
              )}
            </Row>

            <Row label="Zalo:" showDivider={false}>
              <Input
                value={String(data.zalo ?? "")}
                onChangeText={(t: string) =>
                  setData((p) => ({ ...p, zalo: t }))
                }
                placeholder="Nhập số zalo"
                keyboardType="phone-pad"
              />
            </Row>
          </ThemedView>

          {/* Buttons */}
          <ThemedView className="flex-row justify-end gap-12 mt-4">
            <Pressable
              onPress={handleCancel}
              disabled={saving}
              style={({ pressed }) => ({
                height: 42,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: pressed ? "rgba(0,0,0,0.06)" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Text style={{ fontWeight: "700" }}>Hủy</Text>
            </Pressable>

            <Pressable
              onPress={onSave}
              disabled={saving}
              style={({ pressed }) => ({
                height: 42,
                paddingHorizontal: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: "#2baf90",
                backgroundColor: pressed
                  ? "rgba(43,175,144,0.10)"
                  : "transparent",
                alignItems: "center",
                justifyContent: "center",
                opacity: saving ? 0.7 : 1,
              })}
            >
              {saving ? (
                <ThemedView className="flex-row items-center gap-2">
                  <ActivityIndicator />
                  <Text style={{ color: "#2baf90", fontWeight: "700" }}>
                    Đang lưu...
                  </Text>
                </ThemedView>
              ) : (
                <Text style={{ color: "#2baf90", fontWeight: "700" }}>
                  Xác nhận
                </Text>
              )}
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}
