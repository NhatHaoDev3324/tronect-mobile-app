import { SendTenantOTPResetPass, VerifyOTP } from "@/api/authTenantApi";
import { OtpModal } from "@/components/customs/OtpModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/logo/dark-LogoWithWord-v.png")
      : require("@/assets/logo/light-LogoWithWord-v.png");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const onVerifyOtp = async (otp: string) => {
    const mail = email.trim();

    setOtpLoading(true);
    try {
      const res = await VerifyOTP(mail, otp);

      if (res.status) {
        Toast.show({
          type: "success",
          text1: "Xác nhận OTP thành công",
          text2: "Đi tới trang đặt lại mật khẩu.",
        });

        setOtpOpen(false);
        router.push({
          pathname: "/tenant/reset-password" as any,
          params: {
            id: res.data.id,
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Xác nhận OTP thất bại",
          text2: res.message || "Vui lòng kiểm tra lại mã OTP.",
        });
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Xác nhận OTP thất bại";
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
      setOtpLoading(false);
    }
  };


  const SendOtpResetPass = async () => {
    const mail = email.trim();

    if (!mail) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập email của bạn.",
      });
      return;
    }

    if (!validateEmail(mail)) {
      Toast.show({
        type: "error",
        text1: "Định dạng không hợp lệ",
        text2: "Vui lòng nhập đúng định dạng email.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await SendTenantOTPResetPass(mail);

      if (res.status) {
        Toast.show({
          type: "success",
          text1: "Gửi mã thành công",
          text2: res.message || "Vui lòng kiểm tra email của bạn.",
        });
        setOtpOpen(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Gửi mã thất bại",
          text2: res.message || "Không thể gửi mã OTP.",
        });
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Gửi OTP thất bại";
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
  }

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
              Nhập email đã đăng ký tài khoản Tronect với vai trò là Người thuê để nhận được mã OTP đặt lại mật khẩu.
            </Text>
          </View>

          {/* Email */}
          <View className="mt-4 gap-1">
            <Label nativeID="email" className="text-base">
              Email{" "}
            </Label>

            <View className="flex-row items-center gap-2">
              <Input
                aria-labelledby="email"
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập địa chỉ email của bạn"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1"
              />
            </View>
          </View>

          <View className="mt-4">
            <Button
              variant={"tronect"}
              onPress={SendOtpResetPass}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-bold text-white">Gửi mã OTP</Text>
              )}
            </Button>
          </View>

          <View className="mt-6 flex-row justify-center gap-2">
            <Text className="text-muted-foreground">Bạn đã nhớ mật khẩu?</Text>
            <Link href="/tenant/login" asChild>
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
            await SendTenantOTPResetPass(email);
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
