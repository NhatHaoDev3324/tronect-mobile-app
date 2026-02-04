import { deletePostRoomSharingById, getPostsRoomSharingByTenantId, updatePrivacy, updateRoomSharingStatus } from "@/api/postRoomShareApi";
import { LoadingData } from "@/components/customs/LoadingData";
import StatusDropdown from "@/components/customs/manage-post/StatusDropdown";
import { Tag360 } from "@/components/customs/Tag360";
import { TagCheck } from "@/components/customs/TagCheck";
import { TagVip } from "@/components/customs/TagVip";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PostInfoType } from "@/types/postInfoType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function SearchResultScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );

    // const { userID } = useAuthStore();
    const [dataRoom, setDataRoom] = useState<PostInfoType[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [deletePostId, setDeletePostId] = useState<string>("");


    const insets = useSafeAreaInsets();


    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPostsRoomSharingByTenantId();
            setDataRoom(res || []);
        } catch (error) {
            console.log(error);
            router.replace("/tenant/(tabs)");
        } finally {
            setLoading(false);
        }
    }, []);



    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [fetchPosts])
    );

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/tenant/(tabs)");
        }
    };

    const saveEditRoomStatus = async (id: string, label: string, status: string) => {
        try {
            await updateRoomSharingStatus(id, status);
            Toast.show({
                type: "success",
                text1: "Cập nhật trạng thái thành công",
                text2: status === "available" ? `Đã cập nhật trạng thái thành ${label}` : `Đã cập nhật trạng thái thành ${label}`,
                position: "top",
            });
        } catch {
            Toast.show({
                type: "error",
                text1: "Cập nhật trạng thái thất bại",
                text2: "Vui lòng thử lại",
                position: "top",
            });
        }
    };

    const saveEditPrivacy = async (id: string, label: string, privacy: string) => {
        try {
            await updatePrivacy(id, privacy);
            Toast.show({
                type: "success",
                text1: "Cập nhật quyền riêng tư thành công",
                text2: privacy === "public" ? `Đã cập nhật quyền riêng tư thành ${label}` : `Đã cập nhật quyền riêng tư thành ${label}`,
                position: "top",
            });
        } catch {
            Toast.show({
                type: "error",
                text1: "Cập nhật quyền riêng tư thất bại",
                text2: "Vui lòng thử lại",
                position: "top",
            });
        }
    };

    const handleOpenModalDeletePost = async (open: boolean, id: string) => {
        setModalOpen(open);
        setDeletePostId(id);
    };

    const handleDeletePost = async () => {
        try {
            setLoadingDelete(true);
            await deletePostRoomSharingById(deletePostId);
            Toast.show({
                type: "success",
                text1: "Xóa bài viết thành công",
                text2: "Bài viết đã được xóa",
                position: "top",
            });
            setModalOpen(false);
            setDeletePostId("");
            await fetchPosts();
        } catch {
            Toast.show({
                type: "error",
                text1: "Xóa bài viết thất bại",
                text2: "Vui lòng thử lại",
                position: "top",
            });
        } finally {
            setLoadingDelete(false);
        }
    };


    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Pressable
                        onPress={() => handleBack()}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-semibold text-white">Quản lý bài đăng</Text>
                    <Pressable onPress={() => router.push("/tenant/(tabs)/post")}>
                        <Ionicons name="add" size={24} color="white" />
                    </Pressable>
                </View>
            </View>
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <LoadingData />
                </View>
            ) : (
                <ScrollView
                    className="px-4 "
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                >
                    <View className="flex-row flex-wrap justify-between gap-y-2 mt-4">
                        {dataRoom.map(item => (
                            <View key={item.id} style={{ width: "100%" }} className="flex-row gap-2 border border-border p-2 rounded-xl">
                                <Pressable style={{ width: "49%" }} onPress={() => router.push({ pathname: "/tenant/post-detail", params: { slug: item.slug, category: item.category || "", }, })}>
                                    <Card className="relative overflow-hidden bg-background border-border p-0 gap-0">
                                        <View style={{ position: "relative" }}>
                                            <Image
                                                source={{ uri: item.images[0] }}
                                                style={{ width: "100%", height: 120 }}
                                                contentFit="cover"
                                            />

                                            <View style={{ position: "absolute", top: 8, left: 8 }}>
                                                <TagCheck verification_status={item.verification_status} />
                                            </View>

                                            <View
                                                style={{
                                                    position: "absolute",
                                                    bottom: 8,
                                                    right: 8,
                                                    flexDirection: "row",
                                                    gap: 2,
                                                }}
                                            >
                                                <TagVip postType={item.post_type} />
                                                <Tag360 picture_360={item.picture_360} />
                                            </View>
                                        </View>

                                        <View className="p-2">
                                            <Text className="text-sm text-foreground font-semibold line-clamp-2">
                                                {item.title}
                                            </Text>

                                            <View className="flex-row items-center gap-1 mt-1">
                                                <Text className="text-red-500 font-bold text-sm">
                                                    {item.price.toLocaleString()} đ
                                                </Text>
                                                <Text className="text-xs font-semibold">
                                                    • {item.acreage} m²
                                                </Text>
                                            </View>

                                            <View className="flex-row items-center gap-1 mt-1">
                                                <Ionicons name="location-outline" size={14} color="gray" />
                                                <Text className="text-xs text-muted-foreground">
                                                    {item.district}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>
                                </Pressable>
                                <View style={{ width: "49%" }} className="flex-1 gap-1">
                                    <View className="flex-col gap-1">
                                        <Text className="text-sm font-semibold text-foreground">Trạng thái:</Text>

                                        <StatusDropdown
                                            data={[
                                                { label: "Còn trống", value: "available" },
                                                { label: "Đã được thuê", value: "unavailable" },
                                            ]}
                                            value={item.status}
                                            onChange={async (label, value) => {
                                                setDataRoom((prev) =>
                                                    prev.map((room) =>
                                                        room.id === item.id
                                                            ? { ...room, status: value }
                                                            : room
                                                    )
                                                );

                                                await saveEditRoomStatus(item.id, label, value);
                                            }}
                                        />
                                    </View>

                                    <View className="flex-col gap-1">
                                        <Text className="text-sm font-semibold text-foreground">Quyền riêng tư:</Text>
                                        <StatusDropdown
                                            data={[
                                                { label: "Công khai", value: "public" },
                                                { label: "Chỉ mình tôi", value: "private" },
                                            ]}
                                            value={item.privacy}
                                            onChange={async (label, value) => {
                                                setDataRoom((prev) =>
                                                    prev.map((room) =>
                                                        room.id === item.id
                                                            ? { ...room, privacy: value }
                                                            : room
                                                    )
                                                );

                                                await saveEditPrivacy(item.id, label, value);
                                            }}
                                        />
                                    </View>

                                    <View className="flex-col gap-1">
                                        <Text className="text-sm font-semibold text-foreground">Tùy chỉnh bài đăng:</Text>
                                        <Pressable className=" w-full flex-row items-center justify-center py-2 rounded-md bg-amber-500">
                                            <Text className="text-white font-semibold">Chỉnh sửa</Text>
                                        </Pressable>
                                        <Pressable onPress={() => handleOpenModalDeletePost(true, item.id)} className=" w-full flex-row items-center justify-center py-2 rounded-md bg-red-600">
                                            <Text className="text-white font-semibold">Xóa</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
            <Modal
                visible={modalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => handleOpenModalDeletePost(false, "")}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center px-6"
                    onPress={() => handleOpenModalDeletePost(false, "")}
                >
                    <View
                        className="rounded-2xl bg-card border border-border p-4"
                    >
                        <ThemedText
                            style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}
                        >
                            Xóa bài đăng
                        </ThemedText>

                        <ThemedText
                            style={{ color: "gray", fontSize: 14, marginBottom: 16 }}
                        >
                            Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.
                        </ThemedText>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    variant="outline"
                                    size={"sm"}
                                    onPress={() => handleOpenModalDeletePost(false, "")}
                                    disabled={loadingDelete}
                                >
                                    <Text>Hủy</Text>
                                </Button>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Button disabled={loadingDelete} size={"sm"} variant={"destructive"} onPress={() => handleDeletePost()}>
                                    <View className="flex-row items-center justify-center min-h-[20px]">
                                        {loadingDelete ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text className="font-semibold text-white">Xóa </Text>
                                        )}
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View >
    );
}
