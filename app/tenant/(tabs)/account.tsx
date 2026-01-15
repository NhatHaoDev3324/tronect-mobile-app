import { tenantMyProfile, tenantUpdateAvatar } from "@/api/authTenantApi";
import noAvatar from "@/assets/images/noAvata.png";
import { DividerCustom } from "@/components/customs/DividerCustom";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDateOnly } from "@/utils/formatDateTime";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    View,
    type ViewProps,
} from "react-native";
import Toast from "react-native-toast-message";
const accountMenus = [
    {
        key: "profile",
        label: "Hồ sơ của tôi",
        icon: "user",
        onPress: () => router.push("/tenant/profile"),
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
        onPress: () => router.push("/tenant/change-password"),
    },
    {
        key: "appearance",
        label: "Giao diện hiển thị",
        icon: "monitor",
        onPress: () => router.push("/tenant/appearance"),
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
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const setUserID = useAuthStore((s) => s.setUserID);
    const setRole = useAuthStore((s) => s.setRole);
    const setUrlImg = useAuthStore((s) => s.setUrlImg);
    const setUserName = useAuthStore((s) => s.setUserName);
    const setProvider = useAuthStore((s) => s.setProvider);
    const setPhone = useAuthStore((s) => s.setPhone);
    const setCreated = useAuthStore((s) => s.setCreated);

    const onRefresh = async () => {
        try {
            setRefreshing(true);

            const res = await tenantMyProfile();
            const profile = res.data || res;

            setUserID(profile.id);
            setRole(profile.role);
            setUrlImg(profile.picture);
            setUserName(profile.username);
            setPhone(profile.phone);
            setProvider(profile.provider);
            setCreated(profile.created_at);

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

    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );

    const confirmLogout = async () => {
        try {
            setLoading(true);
            setLogoutOpen(false);
            await useAuthStore.getState().reset();
            router.replace("/tenant/(tabs)");
            Toast.show({ type: "success", text1: "Đã đăng xuất", position: "top" });
        } catch (e: any) {
            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: e?.message ?? "Đăng xuất thất bại",
                position: "top",
            });
        } finally {
            setLoading(false);
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

    useEffect(() => {
        const init = async () => {
            try {
                if (!userID) {
                    const res = await tenantMyProfile();
                    const profile = res.data || res;

                    setUserID(profile.id);
                    setRole(profile.role);
                    setUserName(profile.username);
                    setUrlImg(profile.picture);
                    setPhone(profile.phone);
                    setProvider(profile.provider);
                    setCreated(profile.created_at);
                }
            } catch (error: any) {
                console.error("Error loading profile:", error);
            }
        };

        init();
    }, []);

    return (
        <ScrollView className="flex-1" style={{ backgroundColor }} refreshControl={
            <RefreshControl
                progressViewOffset={40}
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2baf90"
                colors={["#2baf90"]}
            />
        }>
            <ThemedView className="flex flex-col items-center mt-24 mb-4">
                <ThemedView
                    style={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        marginBottom: 12,
                    }}
                >
                    <Pressable onPress={pickAndUploadAvatar} disabled={uploading}>
                        <Image
                            source={userID ? urlImg : noAvatar}
                            style={{ width: 100, height: 100, borderRadius: 999 }}
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
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "#000",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 2,
                            borderColor: "#fff",
                            opacity: uploading ? 0.6 : 1,
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
            <Modal
                visible={logoutOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setLogoutOpen(false)}
            >
                {/* Backdrop */}
                <Pressable
                    className="flex-1 bg-black/50 justify-center px-6"
                    onPress={() => setLogoutOpen(false)}
                >
                    {/* Card */}
                    <Pressable
                        className="rounded-2xl bg-card border border-border p-4"
                        onPress={() => { }}
                    >
                        <ThemedText
                            style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}
                        >
                            Đăng xuất
                        </ThemedText>

                        <ThemedText
                            style={{ color: "gray", fontSize: 14, marginBottom: 16 }}
                        >
                            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?
                        </ThemedText>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    variant="outline"
                                    onPress={() => setLogoutOpen(false)}
                                    disabled={loading}
                                >
                                    <Text>Hủy</Text>
                                </Button>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Button onPress={confirmLogout} disabled={loading}>
                                    <View className="flex-row items-center justify-center min-h-[20px]">
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text className="font-semibold">Đăng xuất</Text>
                                        )}
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
}
