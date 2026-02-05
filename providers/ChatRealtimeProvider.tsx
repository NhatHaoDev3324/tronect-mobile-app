"use client"

import { getMyIb } from "@/api/chatApi"
import { useAuthStore } from "@/store/useAuthStoreChat"
import { ChatMessage, ConversationDTO, useChatRealtimeStore } from "@/store/useChatRealtimeStore"
import React, { useEffect, useRef } from "react"
import { Platform } from "react-native"

type WsIncoming = unknown

function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null
}
function readString(v: unknown, fallback = ""): string {
    return typeof v === "string" ? v : fallback
}
function readId(v: unknown): number {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string") {
        const n = Number(v)
        return Number.isFinite(n) ? n : 0
    }
    return 0
}
function readTime(v: unknown): string | number {
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string" && v) return v
    return Date.now()
}

function normalizeMessage(raw: WsIncoming): ChatMessage | null {
    if (!isObject(raw)) return null
    if (raw["type"] !== "message") return null

    const conversation_id = readString(raw["conversation_id"])
    if (!conversation_id) return null

    const from_id = readString(raw["from_id"])
    const to_id = readString(raw["to_id"])
    const content = readString(raw["content"])
    if (!from_id || !to_id) return null
    const id = readId(raw["message_id"] ?? raw["id"])
    if (!id) return null


    const referenceRaw = raw["reference"]
    const reference =
        isObject(referenceRaw) && typeof referenceRaw["title"] === "string"
            ? {
                title: readString(referenceRaw["title"]),
                image: readString(referenceRaw["image"]),
                price: readId(referenceRaw["price"]),
            }
            : null

    const replyTo = raw["reply_to_message_id"]
    const reply_to_message_id =
        typeof replyTo === "number" && Number.isFinite(replyTo)
            ? replyTo
            : typeof replyTo === "string"
                ? Number(replyTo)
                : null

    return {
        id: readId(raw["message_id"] ?? raw["id"]),
        conversation_id,
        from_id,
        from_username: readString(raw["from_username"]),
        from_avatar: readString(raw["from_avatar"]),
        to_id,
        to_username: readString(raw["to_username"]),
        to_avatar: readString(raw["to_avatar"]),
        content,
        created_at: readTime(raw["created_at"]),
        reference,
        reply_to_message_id: Number.isFinite(reply_to_message_id as number)
            ? (reply_to_message_id as number)
            : null,
    }
}

function normalizeRecall(raw: WsIncoming): { conversationId: string; messageId: number } | null {
    if (!isObject(raw)) return null
    if (raw["type"] !== "recall") return null

    const conversationId = readString(raw["conversation_id"])
    const messageId = readId(raw["message_id"])
    if (!conversationId || !messageId) return null

    return { conversationId, messageId }
}

export default function ChatRealtimeProvider({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((s) => s.user)
    const wsRef = useRef<WebSocket | null>(null)
    const seenRef = useRef<Set<string>>(new Set())
    const hydrated = useChatRealtimeStore((s) => s.hydrated)
    const hydrateFromIb = useChatRealtimeStore((s) => s.hydrateFromIb)

    const applyIncomingMessage = useChatRealtimeStore((s) => s.applyIncomingMessage)
    const appendMessageToConversation = useChatRealtimeStore((s) => s.appendMessageToConversation)
    const recallMessageLocal = useChatRealtimeStore((s) => s.recallMessageLocal)

    const setSendWs = useChatRealtimeStore((s) => s.setSendWs)

    // ✅ setSendWs 1 lần (ổn định, không stale)
    useEffect(() => {
        setSendWs((payload) => {
            const socket = wsRef.current
            if (!socket) return
            if (socket.readyState !== WebSocket.OPEN) return
            socket.send(JSON.stringify(payload))
        })
        return () => setSendWs(() => { })
    }, [setSendWs])

    // hydrate unread ban đầu
    useEffect(() => {
        if (!user || hydrated) return
        getMyIb().then((res) => {
            const conversations = Array.isArray(res?.conversations)
                ? (res.conversations as ConversationDTO[])
                : []
            hydrateFromIb(conversations, user.id)
        })
    }, [user, hydrated, hydrateFromIb])

    // ✅ 1 WS global
    useEffect(() => {
        if (!user) return

        wsRef.current?.close()
        wsRef.current = null

        const protocol = Platform.OS === "web" ?
            (window.location.protocol === "https:" ? "wss" : "ws") :
            "ws"
        const host = process.env.EXPO_PUBLIC_WS_HOST ?? "[IP_ADDRESS]"

        const ws = new WebSocket(`${protocol}://${host}/ws/chat/${user.id}`)
        wsRef.current = ws

        ws.onmessage = (e) => {
            let parsed: unknown
            try {
                parsed = JSON.parse(e.data) as unknown
            } catch {
                return
            }

            const msg = normalizeMessage(parsed)
            if (msg) {
                const key = `${msg.conversation_id}:${msg.id}`
                if (seenRef.current.has(key)) return
                seenRef.current.add(key)

                applyIncomingMessage(msg, user.id)
                appendMessageToConversation(msg)
                return
            }

            if (seenRef.current.size > 5000) seenRef.current.clear()

            const rc = normalizeRecall(parsed)
            if (rc) {
                recallMessageLocal(rc.conversationId, rc.messageId)
            }
        }

        ws.onclose = () => {
            wsRef.current = null
        }

        return () => {

            wsRef.current = null
        }
    }, [user, applyIncomingMessage, appendMessageToConversation, recallMessageLocal])

    return <>{children}</>
}
