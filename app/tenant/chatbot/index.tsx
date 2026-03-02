import { Send, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteChatHistory, GetChatBotHistory, ReactChatbotMessage, sendChatbotMessage } from '@/api/chatbotApi';
import { AssistantMessageActions } from '@/components/customs/AssistantMessageActions';
import { ChatbotMarkdown } from '@/components/customs/ChatbotMarkdown';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ChatbotMessageDTO, ChatbotReaction } from '@/types/chatbotType';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export default function ChatbotScreen({
    lightColor,
    darkColor,
}: ThemedViewProps) {
    const [messages, setMessages] = useState<ChatbotMessageDTO[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        "background"
    );
    useEffect(() => {
        fetchHistory();
    }, []);

    const setReaction = async (id: string, r: ChatbotReaction) => {
        const target = messages.find(m => m.id === id)
        if (!target || target.role !== "assistant") return

        const prevReaction = target.reaction ?? null
        const nextReaction = r

        setMessages(prev =>
            prev.map(m =>
                m.id === id ? { ...m, reaction: nextReaction } : m
            )
        )

        try {
            await ReactChatbotMessage(id, nextReaction)
        } catch {
            setMessages(prev =>
                prev.map(m =>
                    m.id === id ? { ...m, reaction: prevReaction } : m
                )
            )
            Alert.alert("Lỗi", "Không thể gửi phản hồi")
        }
    }



    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await GetChatBotHistory();
            setMessages([...res.messages].reverse());
        } catch (error) {
            console.error('Failed to fetch history:', error);
            Alert.alert('Lỗi', 'Không thể tải lịch sử chat.');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return

        const text = inputText.trim()
        setInputText('')
        setSending(true)

        const userMsg: ChatbotMessageDTO = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            created_at: new Date().toISOString(),
        }

        const loadingId = `loading-${Date.now()}`

        const loadingMsg: ChatbotMessageDTO = {
            id: loadingId,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
        }

        setMessages(prev => [loadingMsg, userMsg, ...prev])

        try {
            const res = await sendChatbotMessage(text)

            setMessages(prev =>
                prev.map(m =>
                    m.id === loadingId
                        ? {
                            id: res.assistant_message_id,
                            role: 'assistant',
                            content: res.answer,
                            created_at: new Date().toISOString(),
                            reaction: null,
                        }
                        : m
                )
            )
        } catch {
            setMessages(prev =>
                prev.map(m =>
                    m.id === loadingId
                        ? {
                            ...m,
                            content: 'Xin lỗi, hiện tại mình gặp lỗi. Bạn thử lại nhé.',
                        }
                        : m
                )
            )
        } finally {
            setSending(false)
        }
    }


    const handleClearHistory = async () => {
        Alert.alert(
            'Xóa lịch sử',
            'Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await DeleteChatHistory();
                            setMessages([]);
                        } catch (error) {
                            console.error('Failed to delete history:', error);
                            Alert.alert('Lỗi', 'Không thể xóa lịch sử.');
                        }
                    },
                },
            ]
        );
    };

    const renderMessage = ({ item }: { item: ChatbotMessageDTO }) => {
        const isUser = item.role === 'user'
        const isLoading = item.role === 'assistant' && item.content === ''

        return (
            <View className={`my-2 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 20,
                            backgroundColor: '#2baf90',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                        }}
                    >
                        <Image
                            source={require('@/assets/images/chatbot.png')}
                            style={{ width: 20, height: 20 }}
                        />
                    </View>
                )}

                {/* BUBBLE + ACTIONS */}
                <View className="max-w-[75%]">
                    {/* BUBBLE */}
                    <View
                        className={`rounded-2xl px-4 py-2 ${isUser
                            ? 'bg-[#2baf90] rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                            }`}
                    >
                        <ChatbotMarkdown
                            content={isLoading ? '…' : item.content}
                            variant={isUser ? 'user' : 'assistant'}
                        />
                    </View>

                    {/* ACTIONS – chỉ hiện khi assistant & không loading */}
                    {!isUser && !isLoading && (
                        <AssistantMessageActions
                            text={item.content}
                            reaction={item.reaction ?? null}
                            onReact={(r) => setReaction(item.id, r)}
                        />
                    )}
                </View>
            </View>
        )
    }



    return (
        <View style={{ flex: 1 }}>
            <View style={{ paddingTop: insets.top + 12, backgroundColor: "#2baf90" }} className="flex-row items-center justify-between border-b border-border px-4 py-3">
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                        onPress={() => router.back()}
                        style={{ paddingHorizontal: 12 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-xl font-bold text-white">Tronect AI</Text>

                </View>


                <Pressable
                    onPress={handleClearHistory} disabled={messages.length === 0}
                    style={{ paddingHorizontal: 12 }}
                >
                    <Icon as={Trash2} size={20} className="text-destructive" />
                </Pressable>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? -20 : -12}
                style={{ flex: 1 }}
            >
                <ThemedView style={{ flex: 1, backgroundColor: backgroundColor }}>


                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#2baf90" />
                        </View>
                    ) : (
                        messages.length === 0 ? (
                            <View style={{ flex: 1 }}>
                                <View className="flex-1 items-center justify-center px-6">
                                    <Image
                                        source={require('@/assets/images/chatbot.png')}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            marginBottom: 20,
                                        }}
                                        resizeMode="contain"
                                    />

                                    <Text className="text-xl font-bold text-foreground mb-2">
                                        Tronect AI 🤖
                                    </Text>
                                    <Text className="text-center text-muted-foreground mb-6 leading-5">
                                        Tôi là trợ lý ảo của bạn.
                                        Hãy đặt câu hỏi, nhờ tư vấn hoặc trò chuyện bất cứ lúc nào.
                                    </Text>

                                    <View className="bg-muted px-4 py-2 rounded-full">
                                        <Text className="text-sm text-muted-foreground">
                                            💬 Nhập tin nhắn để bắt đầu
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={(item) => item.id}
                                inverted
                                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                            />)
                    )}

                    <View className="flex-row items-center border-t border-border p-3 bg-background" style={{ paddingBottom: insets.bottom }}>
                        <Input
                            className="flex-1 mr-3 rounded-full"
                            placeholder="Nhập tin nhắn..."
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                        />
                        <Button
                            onPress={handleSend}
                            size="icon"
                            variant="tronect"
                            className="rounded-full h-10 w-10"
                            disabled={!inputText.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Icon as={Send} className="text-white ml-0.5" size={18} />
                            )}
                        </Button>
                    </View>
                </ThemedView>
            </KeyboardAvoidingView>
        </View >
    );
}
