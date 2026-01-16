import { ChatbotReaction } from '@/types/chatbotType'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { Pressable, View } from 'react-native'
import Toast from 'react-native-toast-message'

type Props = {
    text: string
    reaction?: ChatbotReaction
    onReact: (r: ChatbotReaction) => void
}

export function AssistantMessageActions({
    text,
    reaction = null,
    onReact,
}: Props) {
    const handleCopy = async () => {
        if (!text?.trim()) return
        await Clipboard.setStringAsync(text)
        Toast.show({
            type: "success",
            text1: "Đã sao chép",
            text2: "Câu trả lời đã được sao chép",
            position: "top",
        });
    }

    return (
        <View className="mt-1 ml-2 flex-row items-center gap-4">
            {/* COPY */}
            <Pressable onPress={handleCopy} hitSlop={10}>
                <Ionicons name="copy-outline" size={18} color="#6b7280" />
            </Pressable>

            {/* CHƯA REACT */}
            {reaction === null && (
                <>
                    <Pressable onPress={() => onReact("like")} hitSlop={10}>
                        <Ionicons name="thumbs-up-outline" size={18} color="#6b7280" />
                    </Pressable>

                    <Pressable onPress={() => onReact("dislike")} hitSlop={10}>
                        <Ionicons name="thumbs-down-outline" size={18} color="#6b7280" />
                    </Pressable>
                </>
            )}

            {/* ĐÃ LIKE */}
            {reaction === "like" && (
                <Pressable onPress={() => onReact(null)} hitSlop={10}>
                    <Ionicons name="thumbs-up" size={18} color="#10b981" />
                </Pressable>
            )}

            {/* ĐÃ DISLIKE */}
            {reaction === "dislike" && (
                <Pressable onPress={() => onReact(null)} hitSlop={10}>
                    <Ionicons name="thumbs-down" size={18} color="#ef4444" />
                </Pressable>
            )}
        </View>
    )
}
