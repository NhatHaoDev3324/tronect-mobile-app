import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { tenantRegisterWithEmail, tenantSendOtp } from "@/api/authTenantApi";
import { OtpModal } from "@/components/customs/OtpModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [securePass, setSecurePass] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [otpOpen, setOtpOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/logo/dark-LogoWithWord-v.png")
      : require("@/assets/logo/light-LogoWithWord-v.png");

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const onRegister = async () => {
    const name = fullName.trim();
    const mail = email.trim();
    const phoneNum = phone.trim();

    if (!name || !mail || !phoneNum || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.",
      });
      return;
    }

    if (!validateEmail(mail)) {
      Toast.show({
        type: "error",
        text1: "Email không hợp lệ",
        text2: "Vui lòng kiểm tra lại địa chỉ email.",
      });
      return;
    }

    if (phoneNum.length < 9 || phoneNum.length > 11) {
      Toast.show({
        type: "error",
        text1: "Số điện thoại không hợp lệ",
        text2: "Số điện thoại phải có ít nhất 9 ký tự và không quá 11 ký tự.",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu quá ngắn",
        text2: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu không khớp",
        text2: "Vui lòng nhập lại xác nhận mật khẩu.",
      });
      return;
    }

    setLoading(true);
    try {
      await tenantSendOtp(mail);

      Toast.show({
        type: "success",
        text1: "Gửi OTP thành công",
        text2: "Vui lòng kiểm tra email của bạn.",
      });

      setOtpOpen(true);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Gửi OTP thất bại";
        Toast.show({
          type: "error",
          text1: message,
          text2: "Vui lòng kiểm tra email và thử lại.",
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

  const onVerifyOtp = async (otp: string) => {
    const name = fullName.trim();
    const mail = email.trim();
    const phoneNum = phone.trim();

    setOtpLoading(true);
    try {
      const res = await tenantRegisterWithEmail(name, mail, phoneNum, password, otp);

      if (!res?.status) {
        Toast.show({
          type: "error",
          text1: "Đăng ký thất bại",
          text2: "Vui lòng thử lại.",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Đăng ký thành công",
        text2: "Bạn có thể đăng nhập ngay bây giờ.",
      });

      setOtpOpen(false);
      router.replace("/tenant/login");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Xác nhận OTP thất bại";
        Toast.show({
          type: "error",
          text1: message,
          text2: "Vui lòng kiểm tra lại mã OTP.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Có lỗi xảy ra",
          text2: "Vui lòng thử lại sau.",
        });
      }
    } finally {
      setOtpLoading(false);
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
              Đăng ký tài khoảng Tronect với vai trò là Người thuê, Tìm trọ
            </Text>
          </View>

          <View className="mt-4 gap-1">
            <Label nativeID="fullName" className="text-base">
              Họ và tên <Text className="text-red-500">*</Text>
            </Label>
            <Input
              aria-labelledby="fullName"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên của bạn"
              autoCapitalize="words"
              className="w-full"
            />
          </View>

          <View className="mt-4 gap-1">
            <Label nativeID="email" className="text-base">
              Email <Text className="text-red-500">*</Text>
            </Label>
            <Input
              aria-labelledby="email"
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập địa chỉ email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="w-full"
            />
          </View>

          <View className="mt-4 gap-1">
            <Label nativeID="phone" className="text-base">
              Số điện thoại <Text className="text-red-500">*</Text>
            </Label>
            <Input
              aria-labelledby="phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại của bạn"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              className="w-full"
            />
          </View>

          <View className="mt-4 gap-1">
            <Label nativeID="password" className="text-base">
              Mật khẩu <Text className="text-red-500">*</Text>
            </Label>

            <View className="relative">
              <Input
                aria-labelledby="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
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
              Xác nhận mật khẩu <Text className="text-red-500">*</Text>
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

          <View className="mt-5">
            <Button
              variant={"tronect"}
              onPress={onRegister}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-bold">Đăng ký</Text>
              )}
            </Button>
          </View>

          <View className="mt-4 flex-row justify-center gap-2">
            <Text className="text-muted-foreground">Bạn đã có tài khoản?</Text>
            <Link href="/tenant/login" asChild>
              <Pressable hitSlop={10}>
                <Text className="font-bold">Đăng nhập</Text>
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

      <OtpModal
        open={otpOpen}
        email={email}
        loading={otpLoading}
        onClose={() => setOtpOpen(false)}
        onSubmit={onVerifyOtp}
        onResend={async () => {
          setOtpOpen(false);
          try {
            setOtpLoading(true);
            await tenantSendOtp(email);
            Toast.show({ type: "success", text1: "Gửi lại OTP thành công", position: "top" });
            setTimeout(() => setOtpOpen(true), 600);
          } catch (err: unknown) {
            if (isAxiosError(err)) {
              const message = err.response?.data?.message || "Gửi OTP thất bại";
              Toast.show({ type: "error", text1: message, position: "top" });
            } else {
              Toast.show({ type: "error", text1: "Gửi OTP thất bại", position: "top" });
            }
          } finally {
            setOtpLoading(false);
          }
        }}
      />
      {otpLoading && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/30">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
}
