import { deletePostById, getPostsByLandlordId, updatePrivacyPost, updateStatusPost } from "@/api/postApi";
import { deletePostRoomSharingById, getPostsRoomSharingByTenantId, updatePrivacyPostRoomSharing, updateRoomSharingStatus } from "@/api/postRoomShareApi";
import { LoadingData } from "@/components/customs/LoadingData";
import StatusDropdown from "@/components/customs/manage-post/StatusDropdown";
import { Tag360 } from "@/components/customs/Tag360";
import { TagCheck } from "@/components/customs/TagCheck";
import { TagVip } from "@/components/customs/TagVip";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/useAuthStore";
import { PostInfoType } from "@/types/postInfoType";
import { formatDateTimeCustom } from "@/utils/formatDateTime";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
    const { role } = useAuthStore();
    const { pathnameBack } = useLocalSearchParams<{ pathnameBack: string }>();
    const [dataRoom, setDataRoom] = useState<PostInfoType[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [deletePostId, setDeletePostId] = useState<string>("");


    const insets = useSafeAreaInsets();


    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            if (role === "tenant") {
                const res = await getPostsRoomSharingByTenantId();
                setDataRoom(res || []);
            } else {
                const res = await getPostsByLandlordId();
                setDataRoom(res || []);
            }
        } catch (error) {
            console.log(error);
            router.replace("/tenant/(tabs)");
        } finally {
            setLoading(false);
        }
    }, [role]);



    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [fetchPosts])
    );

    const saveEditRoomStatus = async (id: string, label: string, status: string) => {
        try {
            if (role === "tenant") {
                await updateRoomSharingStatus(id, status);
            } else {
                await updateStatusPost(id, status);
            }
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
            if (role === "tenant") {
                await updatePrivacyPostRoomSharing(id, privacy);
            } else {
                await updatePrivacyPost(id, privacy);
            }
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
            if (role === "tenant") {
                await deletePostRoomSharingById(deletePostId);
            } else {
                await deletePostById(deletePostId);
            }
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

    const handleBack = () => {
        if (pathnameBack) {
            router.replace(pathnameBack as any);
        } else {
            router.back();
        }
    };


    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Pressable
                        onPress={handleBack}
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
                            <View key={item.id} style={{ width: "100%" }} className="flex-col gap-2 border border-border p-2 rounded-xl">
                                <View className="flex-col">
                                    <Text className="text-base font-semibold text-foreground line-clamp-2">{item.title}</Text>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-red-500 font-bold text-base">
                                            {item.price.toLocaleString()} đ
                                        </Text>
                                        <Text className="text-base font-semibold">•</Text>
                                        <Text className="text-base font-semibold">
                                            {item.acreage} m²
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center gap-1 mt-1" >
                                        <Ionicons name="location-outline" size={16} color="red" />
                                        <Text numberOfLines={1} className="text-sm text-muted-foreground line-clamp-1 w-[90%]">
                                            {item.address}
                                        </Text>
                                    </View>
                                    <View className="flex-col mt-1 border border-border overflow-hidden rounded-sm" >
                                        <View className="flex-row ">
                                            <View className="w-28 bg-muted/50 p-1.5 border-r border-border justify-center">
                                                <Text className="text-sm font-bold text-foreground">Ngày đăng:</Text>
                                            </View>
                                            <View className="flex-1 p-1.5 justify-center">
                                                <Text className="text-sm text-foreground font-medium">{formatDateTimeCustom(item.created_at)}</Text>
                                            </View>
                                        </View>
                                        {
                                            role === "landlord" && (
                                                <View className="flex-row border-t border-border">
                                                    <View className="w-28 bg-muted/50 p-1.5 border-r border-border justify-center">
                                                        <Text className="text-sm font-bold text-foreground">Ngày hết hạn:</Text>
                                                    </View>
                                                    <View className="flex-1 p-1.5 justify-center">
                                                        <Text className="text-sm text-foreground font-medium">{formatDateTimeCustom(item.expire_at)}</Text>
                                                    </View>
                                                </View>
                                            )
                                        }
                                    </View>
                                </View>
                                <View className="flex-row gap-2">
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
                                                    <Tag360 view360={item.picture_360 || item.tour_360 || null} />

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
                                                    <Text className="text-base font-semibold">•</Text>
                                                    <Text className="text-xs font-semibold">
                                                        {item.acreage} m²
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

                                    <View style={{ width: "49%" }} className="flex-1 gap-1 justify-center">
                                        {
                                            item.privacy === "admin_private" ? (
                                                <View className="flex-col gap-1">
                                                    <Text className="text-sm font-semibold text-foreground">Trạng thái:</Text>
                                                    <Text className="text-gray-600 bg-gray-100 border-gray-300 border rounded-md text-center p-2 font-bold text-sm">Quản trị viên đã ẩn</Text>
                                                </View>
                                            ) : (
                                                item?.expire_at && new Date(item.expire_at) < new Date() ? (
                                                    <View className="flex-col gap-1">
                                                        <Text className="text-sm font-semibold text-foreground">Trạng thái:</Text>
                                                        <Text className="text-red-500 bg-red-100 border-red-300 border rounded-md text-center p-2 font-bold text-sm">Bài đăng đã hết hạn</Text>
                                                    </View>
                                                ) : (
                                                    <View>
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

                                                    </View>
                                                )
                                            )
                                        }

                                        <View className="flex-col gap-1">
                                            <Text className="text-sm font-semibold text-foreground">Tùy chỉnh bài đăng:</Text>
                                            {
                                                item.privacy === "admin_private" ? (
                                                    <Pressable onPress={() => router.push("/tenant/support")} className=" w-full flex-row items-center justify-center py-2 rounded-md bg-blue-500 gap-2">
                                                        <Ionicons name="call-outline" size={18} color="white" />
                                                        <Text className="text-white font-semibold">Liên hệ ngay</Text>
                                                    </Pressable>
                                                ) : (
                                                    item?.expire_at && new Date(item.expire_at) < new Date() ? (
                                                        <Pressable onPress={() => router.push({
                                                            pathname: "/landlord/choose-package-extend",
                                                            params: { postId: item.id }
                                                        })} className=" w-full flex-row items-center justify-center py-2 rounded-md bg-green-500 gap-2">
                                                            <Ionicons name="refresh-outline" size={18} color="white" />
                                                            <Text className="text-white font-semibold">Gia hạn ngay</Text>
                                                        </Pressable>
                                                    ) : (
                                                        <Pressable onPress={() => router.push({
                                                            pathname: (role === "tenant" ? "/tenant/edit-post" : "/landlord/edit-post") as any,
                                                            params: { id: item.id }
                                                        })} className=" w-full flex-row items-center justify-center py-2 rounded-md bg-amber-500 gap-2">
                                                            <Ionicons name="create-outline" size={18} color="white" />
                                                            <Text className="text-white font-semibold">Chỉnh sửa</Text>
                                                        </Pressable>
                                                    )

                                                )
                                            }

                                            <Pressable onPress={() => handleOpenModalDeletePost(true, item.id)} className=" w-full flex-row items-center justify-center py-2 rounded-md bg-red-600 gap-2">
                                                <Ionicons name="trash-outline" size={18} color="white" />
                                                <Text className="text-white font-semibold">Xóa</Text>
                                            </Pressable>
                                        </View>
                                    </View>

                                </View>
                                {
                                    item.privacy === "admin_private" ? (
                                        <View>
                                            <Text className="text-sm text-muted-foreground">Bài đăng của bạn hiện đang bị ẩn bởi quản trị viên và tạm thời không được hiển thị công khai trên hệ thống. Vui lòng kiểm tra lại nội dung bài đăng để đảm bảo tuân thủ quy định của Tronect. Nếu bạn cần hỗ trợ hoặc có thắc mắc, hãy liên hệ với đội ngũ quản trị để được giải đáp.</Text>
                                        </View>
                                    ) : (
                                        item?.expire_at && new Date(item.expire_at) < new Date() && (
                                            <View>
                                                <Text className="text-sm text-muted-foreground">Bài đăng của bạn đã hết thời gian hiển thị. Để tiếp tục duy trì thời gian hiển thị, bạn có thể thực hiện gia hạn bài đăng ngay hôm nay. Việc gia hạn sẽ giúp bài viết tiếp tục xuất hiện trên hệ thống của Tronect .</Text>
                                            </View>
                                        )
                                    )
                                }

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
                                    <Text className="font-semibold">Hủy</Text>
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
