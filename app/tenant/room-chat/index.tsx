import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"

import {
    deleteConversationForMe,
    getChatHistory,
    MarkConversationRead,
    RecallMessage,
} from "@/api/chatApi"

// import { useAuthStore } from "@/store/useAuthStoreChat"
import {
    ChatMessage,
    useChatRealtimeStore,
} from "@/store/useChatRealtimeStore"

import { ThemedText } from "@/components/themed-text"
import { useAuthStore } from "@/store/useAuthStore"
import { formatDateHeader, formatTime } from "@/utils/formatDateTime"

const EMPTY_MESSAGES: ChatMessage[] = []

type MessageReference = {
    title: string
    image: string
    price: number
}


export default function RoomChatScreen() {
    const { conversation_id, title, image, price, peer_id, peer_name, peer_avatar } = useLocalSearchParams<{
        conversation_id: string
        title?: string
        image?: string
        price?: string
        peer_id?: string
        peer_name?: string
        peer_avatar?: string
    }>()
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const flatListRef = useRef<FlatList>(null)
    const isAtBottomRef = useRef(true)
    const userID = useAuthStore((s) => s.userID)
    const userName = useAuthStore((s) => s.userName)
    const urlImg = useAuthStore((s) => s.urlImg)
    const [modalOpen, setModalOpen] = useState(false)
    const [loadingDelete, setLoadingDelete] = useState(false)
    const [reference, setReference] = useState<MessageReference | null>(null)

    const {
        chatList,
        messagesByConversation,
        sendWs,
        setCurrentConversation,
        appendMessageToConversation,
        setMessagesForConversation,
        markConversationReadLocal,
        recallMessageLocal,
        removeConversationLocal,
        loadedConversations,
        markConversationLoaded,
    } = useChatRealtimeStore()

    const messages =
        messagesByConversation[conversation_id] ?? EMPTY_MESSAGES
    const isLoaded = !!loadedConversations[conversation_id]

    const effectiveChat = useMemo(() => {
        const chat = chatList.find((c) => c.conversation_id === conversation_id)
        if (chat) return chat
        if (!peer_id) return null
        return {
            conversation_id,
            peer_id,
            peer_name: peer_name ?? "Người dùng",
            peer_avatar: peer_avatar ?? "",
            last_message: "",
            last_time: "",
            unread: 0,
        }
    }, [chatList, conversation_id, peer_id, peer_name, peer_avatar])

    const [text, setText] = useState("")
    const [replying, setReplying] = useState<ChatMessage | null>(null)


    useEffect(() => {
        if (!conversation_id) return

        setCurrentConversation(conversation_id)

        MarkConversationRead(conversation_id).catch(() => { })
        markConversationReadLocal(conversation_id)

        return () => setCurrentConversation(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation_id])

    useEffect(() => {
        if (!conversation_id) return
        if (isLoaded) return // Sử dụng isLoaded thay vì messages.length > 0

        let cancelled = false

        getChatHistory(conversation_id)
            .then((res) => {
                if (cancelled) return
                setMessagesForConversation(conversation_id, res ?? [])
                markConversationLoaded(conversation_id) // Đánh dấu đã load xong
            })
            .catch(() => { })

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation_id, isLoaded])



    const groupedMessages = useMemo(() => {
        const result: (ChatMessage | { id: string; type: "header"; date: string | number })[] = []
        // Ensure messages are sorted by time (oldest to newest)
        const sorted = [...messages].sort((a, b) => {
            const timeA = typeof a.created_at === "string" ? Date.parse(a.created_at) : a.created_at
            const timeB = typeof b.created_at === "string" ? Date.parse(b.created_at) : b.created_at
            return (timeA as number) - (timeB as number)
        })

        const reversed = [...sorted].reverse()

        reversed.forEach((msg, index) => {
            result.push(msg)

            const nextMsg = reversed[index + 1]

            const currentDate = new Date(msg.created_at).toDateString()
            const nextDate = nextMsg ? new Date(nextMsg.created_at).toDateString() : null

            if (currentDate !== nextDate) {
                result.push({
                    id: `header-${currentDate}-${index}`,
                    type: "header",
                    date: msg.created_at
                })
            }
        })

        return result
    }, [messages])

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () => {
            if (!isAtBottomRef.current) return

            requestAnimationFrame(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
            })
        })

        return () => {
            showSub.remove()
        }
    }, [])

    const messageMap = useMemo(() => {
        const map = new Map<number, ChatMessage>()
        for (const m of messages) map.set(m.id, m)
        return map
    }, [messages])

    useEffect(() => {
        if (title) {
            setReference({
                title,
                image: image || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
                price: price ? Number(price) : 0
            })
        }
    }, [title, image, price])


    const handleSend = () => {
        if (!text.trim() || !userID || !effectiveChat) return

        const peerId = effectiveChat.peer_id

        const tempMsg: ChatMessage = {
            id: -Date.now(),
            conversation_id,
            from_id: userID,
            from_username: userName ?? "Bạn",
            from_avatar: urlImg ?? "https://res.cloudinary.com/dldrozhrw/image/upload/v1770456173/taik3i0buyvfjghra9mv.png",
            to_id: peerId,
            to_username: effectiveChat.peer_name,
            to_avatar: effectiveChat.peer_avatar ?? "https://res.cloudinary.com/dldrozhrw/image/upload/v1770456173/taik3i0buyvfjghra9mv.png",
            content: text.trim(),
            created_at: Date.now(),
            reply_to_message_id: replying?.id ?? null,
            reference: reference,
        }

        appendMessageToConversation(tempMsg)

        sendWs({
            type: "message",
            to_id: peerId,
            content: tempMsg.content,
            reply_to_message_id: tempMsg.reply_to_message_id,
            reference: reference,
        })

        setText("")
        setReplying(null)
        setReference(null)

        requestAnimationFrame(() =>
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
        )
    }

    const onLongPressMessage = (m: ChatMessage) => {
        const isMe = m.from_id === userID

        Alert.alert(
            "Tùy chọn",
            undefined,
            [
                {
                    text: "Trả lời",
                    onPress: () => setReplying(m),
                },
                isMe && !m.is_recalled
                    ? {
                        text: "Thu hồi",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await RecallMessage(m.id)

                                sendWs({
                                    type: "recall",
                                    message_id: m.id,
                                    conversation_id,
                                })

                                recallMessageLocal(conversation_id, m.id)
                            } catch (e) {
                                console.error("Recall failed", e)
                            }
                        },
                    }
                    : undefined,
                { text: "Hủy", style: "cancel" },
            ].filter(Boolean) as any
        )
    }

    const handleDeleteConversation = async () => {
        try {
            setLoadingDelete(true)
            await deleteConversationForMe(conversation_id)
            removeConversationLocal(conversation_id)
            setModalOpen(false)
            router.push("/tenant/(tabs)/chat")
        } catch (e) {
            console.log(e)
        } finally {
            setLoadingDelete(false)
        }
    }

    const renderItem = ({ item }: { item: ChatMessage | { id: string; type: "header"; date: string | number } }) => {
        if ("type" in item && item.type === "header") {
            return (
                <View className="items-center py-2 mb-2">
                    <Text className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {formatDateHeader(item.date as string)}
                    </Text>
                </View>
            )
        }

        const msg = item as ChatMessage
        const isMe = msg.from_id === userID

        return (
            <Pressable
                onLongPress={() => onLongPressMessage(msg)}
                className={`my-1 flex-row ${isMe ? "justify-end" : "justify-start items-end"
                    }`}
            >
                {!isMe && (
                    <Image
                        source={{
                            uri: msg.from_avatar || undefined,
                        }}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            marginRight: 6,
                        }}
                    />
                )}

                <View
                    className={`${msg.reference ? "w-[75%]" : "max-w-[75%]"} rounded-2xl px-3 py-2 ${isMe
                        ? "bg-[#2baf90] rounded-br-none"
                        : "bg-background rounded-bl-none"
                        }`}
                >
                    {msg.reference && (
                        <View className={`mb-2 p-2 rounded bg-black/10 border-l-4 flex-row overflow-hidden ${isMe ? "border-white/80" : "border-[#2baf90]/80"}`}>
                            <Image
                                source={{ uri: msg.reference.image }}
                                style={{ width: 44, height: 44, borderRadius: 4 }}
                                contentFit="cover"
                            />
                            <View className="ml-2 flex-1 justify-center">
                                <Text className={`text-xs font-bold ${isMe ? "text-white" : "text-black"}`} numberOfLines={2}>
                                    {msg.reference.title}
                                </Text>
                                <Text className={`text-xs font-bold ${isMe ? "text-yellow-200" : "text-red-600"}`}>
                                    {Number(msg.reference.price).toLocaleString("vi-VN")} đ
                                </Text>
                            </View>
                        </View>
                    )}

                    {msg.reply_to_message_id && (
                        <View
                            className={`mb-2 p-2 rounded bg-black/10 border-l-4 ${isMe ? "border-white/80" : "border-[#2baf90]/80"
                                }`}
                        >
                            <Text
                                className={`text-xs font-bold mb-0.5 ${isMe ? "text-white/90" : "text-black/80"
                                    }`}
                            >
                                {messageMap.get(msg.reply_to_message_id)?.from_username ??
                                    "Người dùng"}
                            </Text>
                            <Text
                                className={`text-xs ${isMe ? "text-white/70" : "text-black/60"
                                    }`}
                                numberOfLines={1}
                            >
                                {messageMap.get(msg.reply_to_message_id)?.content ??
                                    "Tin nhắn đã bị xóa hoặc không tồn tại"}
                            </Text>
                        </View>
                    )}

                    <Text className={`h-fit ${isMe ? "text-white" : ""}`}>
                        {msg.is_recalled
                            ? "Tin nhắn đã được thu hồi"
                            : msg.content}
                    </Text>

                    <Text
                        className={`text-[10px] mt-1 ${isMe ? "text-white" : "dark:text-white text-black "
                            }`}
                    >
                        {formatTime(msg.created_at as string)}
                    </Text>
                </View>
            </Pressable>
        )
    }

    if (!userID) return null

    return (
        <View style={{ flex: 1 }}>
            <View
                style={{ paddingTop: insets.top + 12 }}
                className="flex-row items-center justify-between px-4 py-3 bg-[#2baf90]"
            >
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>

                    <Text className="ml-3 text-lg font-bold text-white">
                        {effectiveChat?.peer_name ?? "Nhắn tin"}
                    </Text>
                </View>

                <Pressable onPress={() => setModalOpen(true)}>
                    <Ionicons name="trash-outline" size={24} color="white" />
                </Pressable>
            </View>

            <FlatList
                ref={flatListRef}
                className="flex-1"
                inverted
                data={groupedMessages}
                renderItem={renderItem}
                keyExtractor={(m) => m.id.toString()}
                contentContainerStyle={{ flexGrow: 1, padding: 12 }}
                onScroll={(e) => {
                    const { contentOffset } = e.nativeEvent
                    isAtBottomRef.current = contentOffset.y < 50
                }}
                scrollEventThrottle={16}
            />


            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}

                keyboardVerticalOffset={Platform.OS === "ios" ? -20 : 0}
            >
                {replying && (
                    <View className="flex-row items-center min-h-12 px-3 py-2 bg-background border-b border-border">
                        <View className="w-1 h-full bg-[#2baf90] mr-1"></View>
                        <View className="flex-col flex-1 px-3">
                            <Text className="text-sm font-bold">
                                {effectiveChat?.peer_name ?? "Nhắn tin"}
                            </Text>
                            <View className="flex-1">
                                <Text className="text-xs line-clamp-1">
                                    Đang trả lời: {replying.content}
                                </Text>
                            </View>
                        </View>
                        <Pressable onPress={() => setReplying(null)}>
                            <Ionicons name="close" size={20} color="black" />
                        </Pressable>
                    </View>

                )}

                {reference && (
                    <View className="flex-row items-center px-3 py-2 bg-background border-b border-border">
                        <View className="w-1 h-full bg-[#2baf90] mr-1"></View>


                        <View className="flex-row flex-1 px-3">
                            <Image source={{ uri: reference.image }} style={{ width: 48, height: 48, borderRadius: 4 }} contentFit="cover" />
                            <View className="flex-col flex-1 ml-2">
                                <Text className="text-sm font-bold line-clamp-2">
                                    {reference.title}
                                </Text>
                                <Text className="text-xs text-red-600 font-semibold">
                                    {Number(reference.price).toLocaleString("vi-VN")} đ
                                </Text>
                            </View>
                        </View>
                        <Pressable onPress={() => {
                            setReference(null)
                        }}>
                            <Ionicons name="close" size={20} color="black" />
                        </Pressable>
                    </View>
                )}



                <View
                    className="flex-row items-center px-3 py-2 bg-background"
                    style={{ paddingBottom: insets.bottom }}
                >
                    <Input
                        className="flex-1 mr-2 rounded-full"
                        value={text}
                        onChangeText={setText}
                        placeholder="Nhập tin nhắn..."
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                    <Button
                        size="icon"
                        className="rounded-full bg-[#2baf90]"
                        onPress={handleSend}
                    >
                        <Ionicons name="send" size={18} color="white" />
                    </Button>
                </View>
            </KeyboardAvoidingView>
            <Modal
                visible={modalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setModalOpen(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-center px-6"
                    onPress={() => setModalOpen(false)}
                >
                    <View
                        className="rounded-2xl bg-card border border-border p-4"
                    >
                        <ThemedText
                            style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}
                        >
                            Xóa cuộc trò chuyện
                        </ThemedText>

                        <ThemedText
                            style={{ color: "gray", fontSize: 14, marginBottom: 16 }}
                        >
                            Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.
                        </ThemedText>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    variant="outline"
                                    size={"sm"}
                                    onPress={() => setModalOpen(false)}
                                    disabled={loadingDelete}
                                >
                                    <Text className="font-semibold">Hủy</Text>
                                </Button>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Button disabled={loadingDelete} size={"sm"} variant={"destructive"} onPress={() => handleDeleteConversation()}>
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
        </View>
    )
}
