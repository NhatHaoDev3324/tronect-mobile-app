import {
    FlatList,
    Pressable,
    ScrollView,
    View,
    type ViewProps
} from "react-native";

import { getPostsSaved, savePost } from "@/api/postApi";
import { getPostsRoomSharingSaved, savePostRoomSharing } from "@/api/postRoomShareApi";
import { Tag360 } from "@/components/customs/Tag360";
import { TagCheck } from "@/components/customs/TagCheck";
import { TagVip } from "@/components/customs/TagVip";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { PostInfoType } from "@/types/postInfoType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function SavedPostsScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );
    const { userID } = useAuthStore();
    const [roomTab, setRoomTab] = useState("room");
    const [post, setPost] = useState<PostInfoType[]>([]);
    const [postRoomShare, setPostRoomShare] = useState<PostInfoType[]>([]);
    // const [initialLoading, setInitialLoading] = useState(false);
    // const phoneNumber = "0832500785";
    // const zaloLink = "https://zalo.me/0832500785";
    const fetchPostProposes = async () => {
        try {
            // setInitialLoading(true);
            const responsePost = await getPostsSaved();
            const responsePostRoomShare = await getPostsRoomSharingSaved();
            setPost(responsePost.data);
            setPostRoomShare(responsePostRoomShare.data);
        } catch {
            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể tải dữ liệu",
                position: "top",
            });
        } finally {
            // setInitialLoading(false);
        }
    };


    useEffect(() => {
        fetchPostProposes();
    }, []);

    const handleSavePost = async (slug: string, category: string) => {
        if (!userID) {
            Toast.show({
                type: "error",
                text1: "Bạn chưa đăng nhập",
                text2: "Vui lòng đăng nhập để lưu bài viết",
            });
            return;
        }

        const removedRoom = post.find(item => item.slug === slug);
        const removedRoomShare = postRoomShare.find(item => item.slug === slug);

        setPost(prev => removeItemBySlug(prev, slug));
        setPostRoomShare(prev => removeItemBySlug(prev, slug));

        try {
            if (category === "phong-o-ghep-tphcm") {
                await savePostRoomSharing(slug);
            } else {
                await savePost(slug);
            }
        } catch {
            if (removedRoom) {
                setPost(prev => [removedRoom, ...prev]);
            }
            if (removedRoomShare) {
                setPostRoomShare(prev => [removedRoomShare, ...prev]);
            }

            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể bỏ lưu bài viết",
            });
        }
    };

    const removeItemBySlug = (list: PostInfoType[], slug: string) =>
        list.filter(item => item.slug !== slug);


    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor }}
            contentContainerStyle={{ paddingBottom: 32 }}
        >

            <View className="my-6 ">
                <View className="px-4 mb-4">
                    <View>
                        {/* Custom Tab Header */}
                        <View className="flex-row mb-4 ">
                            <Pressable onPress={() => setRoomTab("room")} className="mr-6 pb-2">
                                <Text className={cn("text-sm font-semibold", roomTab === "room" ? "text-[#FF6B35]" : "text-gray-400")}>
                                    Phòng trọ
                                </Text>
                                {roomTab === "room" && (
                                    <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                                )}
                            </Pressable>
                            <Pressable onPress={() => setRoomTab("roomShare")} className="pb-2">
                                <Text className={cn("text-sm font-semibold", roomTab === "roomShare" ? "text-[#FF6B35]" : "text-gray-400")}>
                                    Phòng ở ghép
                                </Text>
                                {roomTab === "roomShare" && (
                                    <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                                )}
                            </Pressable>
                        </View>

                        {roomTab === "room" && (
                            <FlatList
                                data={post}
                                numColumns={2}
                                columnWrapperStyle={{ gap: 12 }}
                                contentContainerStyle={{ gap: 12 }}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <Pressable style={{ width: "48%" }} onPress={() => router.push({ pathname: "/tenant/search/[slug]", params: { slug: item.slug, category: item.category || "", }, })}>
                                        <Card className="relative overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0">
                                            <View style={{ position: "relative" }}>
                                                <Image
                                                    source={{ uri: item.images[0] }}
                                                    style={{ width: "100%", height: 120 }}
                                                    contentFit="cover"
                                                />
                                                <View style={{ position: "absolute", top: 8, left: 8 }}>
                                                    <TagCheck verification_status={item.verification_status} />
                                                </View>

                                                <View style={{ position: "absolute", bottom: 8, right: 8, flexDirection: "row", gap: 2 }}>
                                                    <TagVip postType={item.post_type} />
                                                    <Tag360 picture_360={item.picture_360} />
                                                </View>
                                            </View>
                                            <View className="p-2">
                                                <Text className="text-sm font-semibold line-clamp-2">
                                                    {item.title}</Text>
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-row items-center gap-1">
                                                        <Text className="text-red-500 font-bold text-sm">
                                                            {item.price.toLocaleString()} đ
                                                        </Text>
                                                        <Text className="text-xs font-semibold">
                                                            {" • "} {item.acreage} m²
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center gap-1">
                                                    <Ionicons
                                                        name="location-outline"
                                                        size={14}
                                                        color="gray"
                                                    />
                                                    <Text className="text-xs text-muted-foreground">
                                                        {item.district}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card>
                                        <Pressable
                                            style={{
                                                position: "absolute",
                                                right: 10,
                                                bottom: 10,
                                                zIndex: 10,
                                            }}
                                            hitSlop={10}
                                            onPress={() => handleSavePost(item.slug, item.category)}
                                        >
                                            <Ionicons
                                                name={item?.saved?.includes(userID || "") ? "heart" : "heart-outline"}
                                                size={22}
                                                color={item?.saved?.includes(userID || "") ? "red" : "gray"}
                                            />
                                        </Pressable>
                                    </Pressable>
                                )}
                            />
                        )}

                        {roomTab === "roomShare" && (
                            <FlatList
                                data={postRoomShare}
                                numColumns={2}
                                columnWrapperStyle={{ gap: 12 }}
                                contentContainerStyle={{ gap: 12 }}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <Pressable style={{ width: "48%" }} onPress={() => router.push({ pathname: "/tenant/search/[slug]", params: { slug: item.slug, category: item.category || "", }, })}>
                                        <Card className="relative overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0 rounded-md">
                                            <Image
                                                source={{ uri: item.images[0] }}
                                                style={{ width: "100%", height: 120 }}
                                                contentFit="cover"
                                                contentPosition="center"
                                            />
                                            <View className="p-2">
                                                <Text className="text-sm font-semibold line-clamp-2">
                                                    {item.title}
                                                </Text>
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-row items-center gap-1">
                                                        <Text className="text-red-500 font-bold text-sm">
                                                            {item.price.toLocaleString()} đ
                                                        </Text>
                                                        <Text className="text-xs font-semibold">
                                                            {" • "} {item.acreage} m²
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center gap-1">
                                                    <Ionicons
                                                        name="location-outline"
                                                        size={14}
                                                        color="gray"
                                                    />
                                                    <Text className="text-xs text-muted-foreground">
                                                        {item.district}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Pressable
                                                style={{
                                                    position: "absolute",
                                                    right: 10,
                                                    bottom: 10,
                                                    zIndex: 10,
                                                }}
                                                hitSlop={10}
                                                onPress={() => handleSavePost(item.slug, item.category)}
                                            >
                                                <Ionicons
                                                    name={item?.saved?.includes(userID || "") ? "heart" : "heart-outline"}
                                                    size={22}
                                                    color={item?.saved?.includes(userID || "") ? "red" : "gray"}
                                                />
                                            </Pressable>

                                        </Card>
                                    </Pressable>
                                )}
                            />
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
