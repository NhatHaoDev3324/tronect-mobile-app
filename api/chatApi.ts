import api from "@/utils/axios"

export const getChatHistory = async (
    conversationId: string,
    limit = 10000
) => {
    const res = await api.get(
        `/api/chat/conversations/${conversationId}/messages?limit=${limit}`
    )
    return res.data
}

export const getChatConversation = async () => {
    const res = await api.get(
        `/api/conversation/me`
    )
    return res.data.data
}

export const getMyIb = async () => {
    const res = await api.get(
        `/api/conversation/ib`
    )
    return res.data.data
}

export const createConversation = async (user2_id: string) => {
    const res = await api.post(
        `/api/conversation/create`, {user2_id}
    )
    return res.data.data
}

export const deleteConversationForMe = async (id: string) => {
    const res = await api.delete(
        `/api/chat/conversations/${id}`
    )
    return res.data
}


export const RecallMessage = async (id: number) => {
    const res = await api.patch(
        `/api/chat/messages/${id}/recall`
    )
    return res.data
}


export const MarkConversationRead = async (conversationId: string) => {
    const res = await api.post(`/api/chat/conversations/${conversationId}/read`)
    return res.data
}
