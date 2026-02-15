import { create } from "zustand"

export type ChatMessage = {
    id: number
    conversation_id: string
    from_id: string
    from_username: string
    from_avatar: string
    to_id: string
    to_username: string
    to_avatar: string
    content: string
    created_at: string | number

    is_recalled?: boolean
    reference?: { title: string; image: string; price: number } | null
    reply_to_message_id?: number | null
}

export type ConversationDTO = {
    conversation_id: string
    peer_id: string
    peer_username: string
    peer_avatar?: string | null
    last_message: string
    last_message_at: string
    unread_count: number
}

export type ChatUserItem = {
    conversation_id: string
    peer_id: string
    peer_name: string
    peer_avatar?: string
    last_message: string
    last_time: string | number
    unread: number
}

type MessagesByConversation = Record<string, ChatMessage[]>

type State = {
    chatList: ChatUserItem[]
    unreadTotal: number
    currentConversationId: string | null
    hydrated: boolean

    messagesByConversation: MessagesByConversation

    hydrateFromIb: (conversations: ConversationDTO[], myId: string) => void
    setCurrentConversation: (conversationId: string | null) => void

    applyIncomingMessage: (msg: ChatMessage, myId: string) => void
    markConversationReadLocal: (conversationId: string) => void

    setMessagesForConversation: (conversationId: string, messages: ChatMessage[]) => void
    appendMessageToConversation: (msg: ChatMessage) => void
    recallMessageLocal: (conversationId: string, messageId: number) => void


    sendWs: (payload: unknown) => void
    setSendWs: (fn: (payload: unknown) => void) => void


    loadedConversations: Record<string, boolean>
    markConversationLoaded: (conversationId: string) => void

    mergeMessagesForConversation: (conversationId: string, messages: ChatMessage[]) => void
    removeConversationLocal: (conversationId: string) => void
    resetStore: () => void
}

function calcUnreadTotal(list: ChatUserItem[]) {
    return list.reduce((sum, c) => sum + (c.unread || 0), 0)
}

function upsertMessage(list: ChatMessage[], msg: ChatMessage): ChatMessage[] {
    const idx = list.findIndex((m) => m.id === msg.id)
    let next: ChatMessage[]
    if (idx === -1) {
        next = [...list, msg]
    } else {
        next = [...list]
        next[idx] = { ...next[idx], ...msg }
    }
    return next.sort((a, b) => toMs2(a.created_at) - toMs2(b.created_at))
}

function toMs2(t: string | number): number {
    if (typeof t === "number") return t
    const ms = Date.parse(t)
    return Number.isFinite(ms) ? ms : 0
}

function mergeOptimistic(prev: ChatMessage[], msg: ChatMessage): ChatMessage[] {
    if (msg.id > 0) {
        const msgTime = toMs2(msg.created_at)

        const idxTemp = prev.findIndex((m) =>
            m.id < 0 &&
            m.from_id === msg.from_id &&
            m.content === msg.content &&
            Math.abs(toMs2(m.created_at) - msgTime) < 10_000
        )

        if (idxTemp !== -1) {
            const next = [...prev]
            next[idxTemp] = { ...next[idxTemp], ...msg, id: msg.id }
            return next
        }
    }

    return upsertMessage(prev, msg)
}


function mergeById(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const map = new Map<number, ChatMessage>()

    for (const m of prev) map.set(m.id, m)
    for (const m of incoming) {
        const old = map.get(m.id)
        map.set(m.id, old ? { ...old, ...m } : m)
    }

    return Array.from(map.values()).sort(
        (a, b) => toMs2(a.created_at) - toMs2(b.created_at)
    )
}

export const useChatRealtimeStore = create<State>((set, get) => ({
    chatList: [],
    unreadTotal: 0,
    currentConversationId: null,
    hydrated: false,

    messagesByConversation: {},

    hydrateFromIb: (conversations, myId) => {
        const list: ChatUserItem[] = (conversations ?? []).map((c) => ({
            conversation_id: c.conversation_id,
            peer_id: c.peer_id,
            peer_name: c.peer_username,
            peer_avatar: c.peer_avatar ?? undefined,
            last_message: c.last_message,
            last_time: c.last_message_at,
            unread: c.unread_count ?? 0,
        })).sort((a, b) => toMs2(b.last_time) - toMs2(a.last_time))

        set({
            chatList: list,
            unreadTotal: calcUnreadTotal(list),
            hydrated: true,
        })
    },

    setCurrentConversation: (conversationId) =>
        set({ currentConversationId: conversationId }),

    applyIncomingMessage: (msg, myId) => {
        const current = get().currentConversationId

        set((state) => {
            const prev = state.chatList
            const idx = prev.findIndex((c) => c.conversation_id === msg.conversation_id)

            const shouldIncUnread = msg.from_id !== myId && current !== msg.conversation_id

            if (idx !== -1) {
                const list = [...prev]
                const item = list[idx]

                const updated: ChatUserItem = {
                    ...item,
                    last_message: msg.content,
                    last_time: msg.created_at,
                    unread: shouldIncUnread ? item.unread + 1 : item.unread,
                }

                list.splice(idx, 1)
                const next = [updated, ...list].sort((a, b) => toMs2(b.last_time) - toMs2(a.last_time))
                return { chatList: next, unreadTotal: calcUnreadTotal(next) }
            }

            const newItem: ChatUserItem = {
                conversation_id: msg.conversation_id,
                peer_id: msg.from_id === myId ? msg.to_id : msg.from_id,
                peer_name: msg.from_id === myId ? msg.to_username : msg.from_username,
                peer_avatar: msg.from_id === myId ? msg.to_avatar : msg.from_avatar,
                last_message: msg.content,
                last_time: msg.created_at,
                unread: msg.from_id !== myId ? 1 : 0,
            }

            const next = [newItem, ...prev].sort((a, b) => toMs2(b.last_time) - toMs2(a.last_time))
            return { chatList: next, unreadTotal: calcUnreadTotal(next) }
        })
    },

    markConversationReadLocal: (conversationId) => {
        set((state) => {
            const next = state.chatList.map((c) =>
                c.conversation_id === conversationId ? { ...c, unread: 0 } : c
            )
            return { chatList: next, unreadTotal: calcUnreadTotal(next) }
        })
    },

    setMessagesForConversation: (conversationId, messages) => {
        set((state) => {
            const prev = state.messagesByConversation[conversationId] ?? []
            const next = mergeById(prev, messages ?? [])

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: next,
                },
            }
        })
    },

    appendMessageToConversation: (msg) => {
        set((state) => {
            const prev = state.messagesByConversation[msg.conversation_id] ?? []
            const next = mergeOptimistic(prev, msg)
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [msg.conversation_id]: next,
                },
            }
        })
    },



    recallMessageLocal: (conversationId, messageId) => {
        set((state) => {
            const prev = state.messagesByConversation[conversationId] ?? []
            const next = prev.map((m) =>
                m.id === messageId
                    ? { ...m, content: "Tin nhắn đã được thu hồi", is_recalled: true, reference: null }
                    : m
            )
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: next,
                },
            }
        })
    },

    sendWs: () => { },
    setSendWs: (fn) => set({ sendWs: fn }),


    loadedConversations: {},
    markConversationLoaded: (conversationId) =>
        set((s) => ({
            loadedConversations: { ...s.loadedConversations, [conversationId]: true },
        })),

    mergeMessagesForConversation: (conversationId, messages) => {
        set((state) => {
            const prev = state.messagesByConversation[conversationId] ?? []
            let next = prev
            for (const m of messages ?? []) {
                next = upsertMessage(next, m)
            }
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: next,
                },
            }
        })
    },

    removeConversationLocal: (conversationId) => {
        set((state) => {
            const next = state.chatList.filter(
                (c) => c.conversation_id !== conversationId
            )

            const { [conversationId]: _removed, ...restMessages } = state.messagesByConversation
            const { [conversationId]: _removedLoaded, ...restLoaded } = state.loadedConversations

            return {
                chatList: next,
                unreadTotal: calcUnreadTotal(next),
                messagesByConversation: restMessages,
                loadedConversations: restLoaded,
            }
        })
    },

    resetStore: () => {
        set({
            chatList: [],
            unreadTotal: 0,
            currentConversationId: null,
            hydrated: false,
            messagesByConversation: {},
            loadedConversations: {},
        })
    },
}))
