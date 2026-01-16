export type ChatbotRole = "user" | "assistant"

export type ChatbotMessageDTO = {
    id: string
    role: ChatbotRole
    content: string
    created_at: string
    reaction?: ChatbotReaction
}


export type ChatbotHistoryResponse = {
    messages: ChatbotMessageDTO[]
}

export type ChatbotResponse = {
    answer: string
    assistant_message_id: string
    results?: unknown[]
}

export type ChatbotReaction = "like" | "dislike" | null

export type ReactChatbotResponse = {
    message_id: string
    reaction: "like" | "dislike" | null
}