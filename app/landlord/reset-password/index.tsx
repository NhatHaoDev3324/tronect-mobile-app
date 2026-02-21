import { ResetPassLandlord } from "@/api/authLandlordApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { Image } from "expo-image";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ResetPassword() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const [securePass, setSecurePass] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/logo/dark-LogoWithWord-v.png")
      : require("@/assets/logo/light-LogoWithWord-v.png");

  const onSubmit = async () => {
    const newPassword = password.trim();
    const confirm = confirmPassword.trim();

    if (!id) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Phiên làm việc không hợp lệ. Vui lòng thử lại.",
      });
      return;
    }

    if (!newPassword || !confirm) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập đầy đủ mật khẩu.",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu quá ngắn",
        text2: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }

    if (newPassword !== confirm) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu không khớp",
        text2: "Xác nhận mật khẩu không chính xác.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await ResetPassLandlord(id, newPassword);

      if (res.status) {
        Toast.show({
          type: "success",
          text1: "Đặt lại mật khẩu thành công",
          text2: "Bạn có thể đăng nhập ngay bây giờ.",
        });
        router.push({
          pathname: "/landlord/login"
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Đặt lại mật khẩu thất bại",
          text2: res.message || "Vui lòng kiểm tra lại thông tin.",
        });
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Đặt lại mật khẩu thất bại";
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Có lỗi xảy ra",
          text2: "Vui lòng thử lại sau.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 24, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-col gap-4 items-center justify-center">
            <Image
              source={logoSource}
              style={{ height: 60, width: 320 }}
              contentFit="contain"
            />
            <Text className="text-center text-muted-foreground w-80">
              Vui lòng nhập mật khẩu mới của bạn bên dưới để hoàn tất quá trình đặt lại mật khẩu.
            </Text>
          </View>

          <View className="mt-4 gap-1">
            <Label nativeID="password" className="text-base">
              Mật khẩu mới <Text className="text-red-500">*</Text>
            </Label>

            <View className="relative">
              <Input
                aria-labelledby="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={securePass}
                autoCapitalize="none"
                className="pr-12"
              />

              <Pressable
                onPress={() => setSecurePass((s) => !s)}
                hitSlop={10}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Ionicons
                  name={securePass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="gray"
                />
              </Pressable>
            </View>
          </View>

          <View className="mt-4 gap-1">
            <Label nativeID="confirmPassword" className="text-base">
              Xác nhận mật khẩu mới <Text className="text-red-500">*</Text>
            </Label>

            <View className="relative">
              <Input
                aria-labelledby="confirmPassword"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry={secureConfirm}
                autoCapitalize="none"
                className="pr-12"
              />

              <Pressable
                onPress={() => setSecureConfirm((s) => !s)}
                hitSlop={10}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Ionicons
                  name={secureConfirm ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="gray"
                />
              </Pressable>
            </View>
          </View>

          <View className="mt-4">
            <Button
              variant={"tronect"}
              onPress={() => onSubmit()}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-bold text-white">Xác nhận</Text>
              )}
            </Button>
          </View>

          <View className="mt-6 flex-row justify-center gap-2">
            <Text className="text-muted-foreground">Bạn đã nhớ mật khẩu?</Text>
            <Link href="/landlord/login" asChild>
              <Pressable hitSlop={10}>
                <Text className="font-bold">Đăng nhập ngay </Text>
              </Pressable>
            </Link>
          </View>


          <Pressable
            onPress={() => router.back()}
            className="mt-5 self-center flex-row items-center gap-1"
          >
            <Ionicons name="chevron-back" size={18} color="gray" />
            <Text className="text-muted-foreground">Quay lại</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
