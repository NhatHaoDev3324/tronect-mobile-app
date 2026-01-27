import { getRelatedPosts, savePost } from "@/api/postApi";
import { getRelatedPostRoomSharing, savePostRoomSharing } from "@/api/postRoomShareApi";
import { useAuthStore } from "@/store/useAuthStore";
import { PostInfoType } from "@/types/postInfoType";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { Card } from "../ui/card";
import Tag360 from "./Tag360";
import TagCheck from "./TagCheck";
import TagVip from "./TagVip";

interface RoomSameAreaProps {
    slug: string;
    category: string;
}

export default function RoomSameArea({ slug, category }: RoomSameAreaProps) {
    const { userID } = useAuthStore()
    const [post, setPost] = useState<PostInfoType[]>([])

    useEffect(() => {
        const fetchPost = async () => {
            try {
                let res;
                if (category === "phong-o-ghep-tphcm") {
                    res = await getRelatedPostRoomSharing(slug);
                } else {
                    res = await getRelatedPosts(slug);
                }
                setPost(res);
            } catch (error) {
                console.log("Error fetching post:", error);
            }
        };
        fetchPost();
    }, [slug]);

    const toggleSaveInList = (list: PostInfoType[], slug: string) =>
        list.map(item => {
            if (item.slug !== slug) return item;

            const saved = Array.isArray(item.saved) ? item.saved : [];
            const hasSaved = saved.includes(userID!);

            return {
                ...item,
                saved: hasSaved
                    ? saved.filter(id => id !== userID)
                    : [...saved, userID!],
            };
        });

    const handleSavePost = async (slug: string, category: string) => {
        if (!userID) {
            Toast.show({
                type: "error",
                text1: "Bạn chưa đăng nhập",
                text2: "Vui lòng đăng nhập để lưu bài viết",
            });
            return;
        }

        setPost(prev => toggleSaveInList(prev, slug));


        try {
            if (category === "phong-o-ghep-tphcm") {
                await savePostRoomSharing(slug);
            } else
                await savePost(slug);
        }

        catch {
            setPost(prev => toggleSaveInList(prev, slug));


            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không thể lưu bài viết",
            });
        }
    }

    if (post.length === 0) {
        return null;
    }

    return (

        <View className="px-4 py-2 flex-col gap-2">
            <Text className="text-lg font-bold text-foreground">
                Phòng trọ gần khu vực này
            </Text>
            <View>
                <FlatList
                    data={post}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 12 }}
                    contentContainerStyle={{ gap: 12 }}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <Pressable style={{ width: "48%" }} onPress={() => router.push({ pathname: "/tenant/post-detail", params: { slug: item.slug, category: item.category || "", }, })}>
                            <Card className="overflow-hidden bg-background border-gray-200 dark:border-gray-900 p-0 gap-0">
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
            </View>
        </View>
    );
};

