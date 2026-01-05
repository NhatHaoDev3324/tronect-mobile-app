import { tenantLoginWithEmail, tenantMyProfile } from "@/api/authTenantApi";
import LogoGoogle from "@/assets/icon/google-icon.svg";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import * as Google from "expo-auth-session/providers/google";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/store/useAuthStore";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
    const setUserID = useAuthStore((s) => s.setUserID);
    const setRole = useAuthStore((s) => s.setRole);
    const setUrlImg = useAuthStore((s) => s.setUrlImg);
    const setUserName = useAuthStore((s) => s.setUserName);
    const setProvider = useAuthStore((s) => s.setProvider);
    const setPhone = useAuthStore((s) => s.setPhone);
    const setCreated = useAuthStore((s) => s.setCreated);

  const logoSource =
    colorScheme === "dark"
      ? require("@/assets/logo/dark-LogoWithWord-v.png")
      : require("@/assets/logo/light-LogoWithWord-v.png");

  const googleConfig = useMemo(
    () => ({
      expoClientId: "YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com",
      iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
      androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
      webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    }),
    []
  );

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  React.useEffect(() => {
    if (response?.type === "success") {
      Toast.show({
        type: "success",
        text1: "Google login",
        text2: "Đăng nhập Google thành công.",
      });
    }
  }, [response]);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập email và mật khẩu.",
      });
      return;
    }
    setLoading(true);
    try {
      const result = await tenantLoginWithEmail(email.trim(), password);
      if (!result?.status || !result?.accessToken) {
        Toast.show({
          type: "error",
          text1: "Đăng nhập thất bại",
          text2: "Vui lòng thử lại.",
        });
        return;
      }

      await AsyncStorage.setItem("accessToken", result.accessToken);

      const res = await tenantMyProfile();
        setUserID(res.data.id);
        setRole(res.data.role);
        setUrlImg(res.data.picture);
        setUserName(res.data.username);
        setPhone(res.data.phone);
        setProvider(res.data.provider);
        setCreated(res.data.created_at);

      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công",
        text2: "Chào mừng bạn quay lại.",
      });
      router.replace("/tenant/(tabs)");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Đăng nhập thất bại";

        Toast.show({
          type: "error",
          text1: message,
          text2: "Vui lòng kiểm tra và thử lại.",
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

  const onGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể đăng nhập Google.",
      });
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
              Đăng nhập vào tài khoản Tronect với vai trò là Người thuê, Tìm trọ
            </Text>
          </View>

          {/* Email */}
          <View className="mt-4 gap-1">
            <Label nativeID="email" className="text-base font-bold">
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

          <View className="mt-4 gap-1">
            <Label nativeID="password" className="text-base font-bold">
              Mật khẩu
            </Label>

            {/* Wrapper phải relative */}
            <View className="relative">
              <Input
                aria-labelledby="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu của bạn"
                secureTextEntry={secure}
                autoCapitalize="none"
                className="pr-12"
              />

        
              <Pressable
                onPress={() => setSecure((s) => !s)}
                hitSlop={10}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="gray"
                />
              </Pressable>
            </View>
          </View>

      
          <View className="mt-2 items-end">
            <Link href="/tenant/forgot-password" asChild>
              <Pressable hitSlop={10}>
                <Text className="font-semibold text-sm">Quên mật khẩu?</Text>
              </Pressable>
            </Link>
          </View>

   
          <View className="mt-4">
            <Button
              variant={"tronect"}
              onPress={onLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-extrabold">Đăng nhập</Text>
              )}
            </Button>
          </View>

  
          <View className="my-4 flex-row items-center gap-2">
            <Separator className="flex-1" />
            <Text className="text-muted-foreground">hoặc</Text>
            <Separator className="flex-1" />
          </View>

          <Button
            onPress={onGoogleLogin}
            disabled={!request}
            className="w-full border border-border"
            variant={"outline"}
          >
            <View className="flex-row items-center gap-2">
              <Image
                source={LogoGoogle}
                style={{ height: 20, width: 20 }}
                contentFit="contain"
              />
              <Text className="font-extrabold">Tiếp tục với Google</Text>
            </View>
          </Button>


          <View className="mt-6 flex-row justify-center gap-2">
            <Text className="text-muted-foreground">Chưa có tài khoản?</Text>
            <Link href="/tenant/register" asChild>
              <Pressable hitSlop={10}>
                <Text className="font-extrabold">Đăng ký </Text>
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
