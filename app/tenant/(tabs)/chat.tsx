import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    View,
    type ViewProps
} from "react-native";

import { deleteConversationForMe } from "@/api/chatApi";
import noAvatar from "@/assets/images/noAvata.png";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useChatRealtimeStore } from "@/store/useChatRealtimeStore";
import { formatTime } from "@/utils/formatDateTime";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function ChatScreen({ lightColor, darkColor }: ThemedViewProps) {
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );
    const [keyword, setKeyword] = useState("");
    const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");
    const insets = useSafeAreaInsets();
    const chatList = useChatRealtimeStore((s) => s.chatList)
    const removeConversationLocal = useChatRealtimeStore((s) => s.removeConversationLocal)

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    function normalizeText(text: string) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
    }

    const filteredChats = useMemo(() => {
        const key = normalizeText(keyword);
        let result = chatList;

        if (filterType === "unread") {
            result = result.filter((c) => c.unread > 0);
        } else if (filterType === "read") {
            result = result.filter((c) => c.unread === 0);
        }

        if (key) {
            result = result.filter((c) =>
                normalizeText(c.peer_name).includes(key)
            );
        }

        return [...result].sort((a, b) => {
            const timeA = typeof a.last_time === "string" ? Date.parse(a.last_time) : a.last_time;
            const timeB = typeof b.last_time === "string" ? Date.parse(b.last_time) : b.last_time;
            return (timeB as number) - (timeA as number);
        });
    }, [chatList, keyword, filterType]);

    const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
    const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);

    const closeSwipeable = (id: string) => {
        const ref = swipeableRefs.current.get(id);
        ref?.close();
        setOpenSwipeableId(null);
    };

    const confirmDelete = async () => {
        if (!selectedChatId) return;
        try {
            setIsDeleting(true);
            await deleteConversationForMe(selectedChatId);
            removeConversationLocal(selectedChatId);
            setModalVisible(false);
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện");
            closeSwipeable(selectedChatId);
        } finally {
            setIsDeleting(false);
            setSelectedChatId(null);
        }
    };

    const onCancelDelete = () => {
        if (selectedChatId) {
            closeSwipeable(selectedChatId);
        }
        setModalVisible(false);
        setSelectedChatId(null);
    };

    const renderRightActions = (conversationId: string) => {
        return (
            <View className="flex-row">
                <Pressable
                    onPress={() => {
                        setSelectedChatId(conversationId);
                        setModalVisible(true);
                    }}
                    className="bg-red-600 w-20 justify-center items-center h-full"
                >
                    <Ionicons name="trash-outline" size={24} color="white" />
                    <Text className="text-white text-xs font-bold mt-1">Xóa</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center border-b border-border px-4 py-3">
                <View className="flex-row items-center bg-white rounded-full px-4 h-10 flex-1">
                    <Ionicons name="search-outline" size={20} color="#6b7280" />
                    <TextInput
                        value={keyword}
                        onChangeText={setKeyword}
                        placeholder="Tìm kiếm người từng chat..."
                        placeholderTextColor="#9ca3af"
                        className="ml-2 flex-1 text-base"
                        returnKeyType="search"
                    />
                </View>

            </View>
            <View className="flex-row items-center gap-2 px-4 py-2 border-b border-border">
                <Pressable
                    onPress={() => setFilterType("all")}
                    className={`border border-border rounded-full px-3 py-1 ${filterType === "all" ? "bg-[#20ab90]" : "bg-muted"}`}
                >
                    <Text className={`text-xs font-semibold ${filterType === "all" ? "text-white" : "text-foreground"}`}>Tất cả</Text>
                </Pressable>
                <Pressable
                    onPress={() => setFilterType("unread")}
                    className={`border border-border rounded-full px-3 py-1 ${filterType === "unread" ? "bg-[#20ab90]" : "bg-muted"}`}
                >
                    <Text className={`text-xs font-semibold ${filterType === "unread" ? "text-white" : "text-foreground"}`}>Chưa đọc</Text>
                </Pressable>
                <Pressable
                    onPress={() => setFilterType("read")}
                    className={`border border-border rounded-full px-3 py-1 ${filterType === "read" ? "bg-[#20ab90]" : "bg-muted"}`}
                >
                    <Text className={`text-xs font-semibold ${filterType === "read" ? "text-white" : "text-foreground"}`}>Đã đọc</Text>
                </Pressable>
            </View>
            <ScrollView className="flex-col bg-background" contentContainerClassName={filteredChats.length === 0 ? "flex-1 justify-center" : "flex-grow"}>
                {filteredChats.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-10 -mt-20">
                        <View className="p-4">
                            <Ionicons
                                name={keyword ? "search-outline" : "chatbubbles-outline"}
                                size={80}
                                color="#2baf90"
                                style={{ opacity: 0.8 }}
                            />
                        </View>
                        <Text className="text-xl font-bold text-foreground text-center mb-2">
                            {keyword ? "Không tìm thấy kết quả" : "Chưa có tin nhắn nào"}
                        </Text>
                        <Text className="text-muted-foreground text-center text-base leading-6">
                            {keyword
                                ? `Không tìm thấy cuộc trò chuyện nào phù hợp với từ khóa "${keyword}"`
                                : "Khi bạn bắt đầu trò chuyện với người khác, các cuộc hội thoại sẽ xuất hiện tại đây."
                            }
                        </Text>
                        {!keyword && (
                            <Pressable
                                className="mt-6 bg-[#2baf90] px-6 rounded-full h-10 items-center justify-center"
                                onPress={() => router.push("/tenant/(tabs)")}
                            >
                                <Text className="text-white font-bold text-base">Khám phá ngay</Text>
                            </Pressable>
                        )}
                    </View>
                ) : (
                    filteredChats.map((c) => (
                        <Swipeable
                            key={c.conversation_id}
                            ref={(ref) => {
                                if (ref) {
                                    swipeableRefs.current.set(c.conversation_id, ref);
                                } else {
                                    swipeableRefs.current.delete(c.conversation_id);
                                }
                            }}
                            renderRightActions={() => renderRightActions(c.conversation_id)}
                            onSwipeableOpen={() => setOpenSwipeableId(c.conversation_id)}
                            onSwipeableClose={() => setOpenSwipeableId(null)}
                        >
                            <Pressable
                                onPress={() => {
                                    if (openSwipeableId !== c.conversation_id) {
                                        router.push({ pathname: "/tenant/room-chat", params: { conversation_id: c.conversation_id } });
                                    }
                                }}
                                className="flex-row items-center px-4 py-3 border-b border-border/60 bg-background"
                            >
                                <View className="flex-row items-start flex-1">
                                    <Image
                                        source={c.peer_avatar ? { uri: c.peer_avatar } : noAvatar}
                                        style={{ width: 52, height: 52, borderRadius: 999 }}
                                        contentFit="cover"
                                    />
                                    <View className="flex-col ml-4 w-fit">
                                        <Text className="text-lg font-bold text-foreground">{c.peer_name}</Text>
                                        <Text className={` line-clamp-1 ${c.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{c.last_message}</Text>
                                    </View>
                                </View>
                                <View className="flex-col gap-1 justify-between items-end ml-16">
                                    <Text className="text-muted-foreground">{formatTime(c.last_time as string)}</Text>
                                    <View className={`rounded-full h-5 w-5 items-center justify-center ${c.unread > 0 ? "bg-red-600 opacity-100" : "bg-transparent opacity-0"}`}>
                                        <Text className="text-white text-xs">{c.unread >= 10 ? "9+" : c.unread}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        </Swipeable>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={onCancelDelete}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center px-6"
                    onPress={onCancelDelete}
                >
                    <View
                        className="rounded-2xl bg-card border border-border p-4"
                        onStartShouldSetResponder={() => true}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        <Text className="text-lg font-bold mb-2 text-foreground">Xóa cuộc trò chuyện</Text>

                        <Text style={{ color: "gray", fontSize: 14, marginBottom: 16 }}>
                            Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.
                        </Text>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    variant="outline"
                                    size={"sm"}
                                    onPress={onCancelDelete}
                                    disabled={isDeleting}
                                >
                                    <Text className="font-semibold">Hủy</Text>
                                </Button>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Button
                                    disabled={isDeleting}
                                    size={"sm"}
                                    variant={"destructive"}
                                    className="bg-red-600"
                                    onPress={confirmDelete}
                                >
                                    <View className="flex-row items-center justify-center min-h-[20px]">
                                        {isDeleting ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text className="font-semibold text-white">Xóa</Text>
                                        )}
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}
