import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  type ViewProps,
} from "react-native";

import Toast from "react-native-toast-message";

import { landlordUpdatePass } from "@/api/authLandlordApi";
import { tenantUpdatePass } from "@/api/authTenantApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export default function ChangePassword({
  lightColor,
  darkColor,
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );

  const { role } = useAuthStore();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!oldPassword || !newPassword || !confirmNewPassword) return false;
    if (newPassword.length < 6) return false;
    if (newPassword !== confirmNewPassword) return false;
    if (newPassword === oldPassword) return false;
    return true;
  }, [oldPassword, newPassword, confirmNewPassword]);

  const toastError = (text: string) =>
    Toast.show({
      type: "error",
      text1: "Lỗi",
      text2: text,
      position: "top",
    });

  const toastSuccess = (text: string) =>
    Toast.show({
      type: "success",
      text1: "Thành công",
      text2: text,
      position: "top",
    });

  const onSubmit = async () => {
    // validate
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return toastError("Vui lòng nhập đầy đủ các trường.");
    }
    if (newPassword.length < 6) {
      return toastError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }
    if (newPassword !== confirmNewPassword) {
      return toastError("Xác nhận mật khẩu mới không khớp.");
    }
    if (newPassword === oldPassword) {
      return toastError("Mật khẩu mới phải khác mật khẩu cũ.");
    }

    try {
      setLoading(true);

      let res;
      if (role === "tenant") {
        res = await tenantUpdatePass(oldPassword, newPassword);
      } else {
        res = await landlordUpdatePass(oldPassword, newPassword);
      }

      toastSuccess(res?.message ?? "Đổi mật khẩu thành công.");

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại.";

      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4" style={{ backgroundColor }}>
      <View className="mt-2 gap-4">
        <View className="gap-2">
          <Label>
            Mật khẩu cũ <Text className="text-red-500">*</Text>
          </Label>
          <View className="relative">
            <Input
              editable={!loading}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Nhập mật khẩu cũ"
              secureTextEntry={!showOld}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowOld((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              hitSlop={10}
            >
              <Feather
                name={showOld ? "eye" : "eye-off"}
                size={18}
                color={textColor}
              />
            </Pressable>
          </View>
        </View>

        <View className="gap-2">
          <Label>
            Mật khẩu mới <Text className="text-red-500">*</Text>
          </Label>
          <View className="relative">
            <Input
              editable={!loading}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              hitSlop={10}
            >
              <Feather
                name={showNew ? "eye" : "eye-off"}
                size={18}
                color={textColor}
              />
            </Pressable>
          </View>
          <Text className="text-xs text-muted-foreground">
            Mật khẩu nên có ít nhất 6 ký tự.
          </Text>
        </View>

        <View className="gap-2">
          <Label>
            Xác nhận mật khẩu mới <Text className="text-red-500">*</Text>
          </Label>
          <View className="relative">
            <Input
              editable={!loading}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              hitSlop={10}
            >
              <Feather
                name={showConfirm ? "eye" : "eye-off"}
                size={18}
                color={textColor}
              />
            </Pressable>
          </View>

          {confirmNewPassword.length > 0 &&
            newPassword !== confirmNewPassword && (
              <Text className="text-xs text-destructive">
                Mật khẩu xác nhận không khớp.
              </Text>
            )}
        </View>

        <Button
          onPress={onSubmit}
          disabled={!canSubmit || loading}
          className="w-full"
          variant={"tronect"}
        >
          <View className="flex-row items-center justify-center min-h-[20px]">
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-semibold">Đổi mật khẩu</Text>
            )}
          </View>
        </Button>
      </View>
    </ScrollView>
  );
}
