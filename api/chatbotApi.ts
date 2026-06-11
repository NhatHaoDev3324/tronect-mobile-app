import {
    ChatbotHistoryResponse,
    ChatbotReaction,
    ChatbotResponse,
    ReactChatbotResponse,
} from "@/types/chatbotType"
import api from "@/utils/axios"

export const sendChatbotMessage = async (
    message: string
): Promise<ChatbotResponse> => {

    const res = await api.post<ChatbotResponse>("/api/chatbot/chatgpt", {
        message,
    })

    return res.data
}

export const GetChatBotHistory = async (): Promise<ChatbotHistoryResponse> => {

    const res = await api.get<ChatbotHistoryResponse>(
        `/api/chatbot/history`
    )

    return res.data
}

export const DeleteChatHistory = async (): Promise<{ message: string }> => {

    const res = await api.delete<{ message: string }>(
        `/api/chatbot/history`
    )

    return res.data
}


export const ReactChatbotMessage = async (
    message_id: string,
    reaction: ChatbotReaction
): Promise<ReactChatbotResponse> => {

    const res = await api.post<ReactChatbotResponse>("/api/chatbot/react", {
        message_id,
        reaction,
    })

    return res.data
}