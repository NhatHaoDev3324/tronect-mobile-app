"use client"

import { getMyIb } from "@/api/chatApi"
import { useAuthStore } from "@/store/useAuthStore"
import { ChatMessage, ConversationDTO, useChatRealtimeStore } from "@/store/useChatRealtimeStore"
import NetInfo from "@react-native-community/netinfo"
import React, { useEffect, useRef } from "react"
import { AppState, type AppStateStatus } from "react-native"

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
    const userID = useAuthStore((s) => s.userID)
    const wsRef = useRef<WebSocket | null>(null)
    const seenRef = useRef<Set<string>>(new Set())
    const hydrated = useChatRealtimeStore((s) => s.hydrated)
    const hydrateFromIb = useChatRealtimeStore((s) => s.hydrateFromIb)

    const applyIncomingMessage = useChatRealtimeStore((s) => s.applyIncomingMessage)
    const appendMessageToConversation = useChatRealtimeStore((s) => s.appendMessageToConversation)
    const recallMessageLocal = useChatRealtimeStore((s) => s.recallMessageLocal)

    const setSendWs = useChatRealtimeStore((s) => s.setSendWs)

    useEffect(() => {
        setSendWs((payload) => {
            const socket = wsRef.current
            if (!socket) return
            if (socket.readyState !== WebSocket.OPEN) return
            socket.send(JSON.stringify(payload))
        })
        return () => setSendWs(() => { })
    }, [setSendWs])

    useEffect(() => {
        seenRef.current.clear()
    }, [userID])
    useEffect(() => {
        if (!userID || hydrated) return
        getMyIb().then((res) => {
            const conversations = Array.isArray(res?.conversations)
                ? (res.conversations as ConversationDTO[])
                : []
            hydrateFromIb(conversations, userID)
        })
    }, [userID, hydrated, hydrateFromIb])

    useEffect(() => {
        if (!userID) return

        let reconnectTimer: ReturnType<typeof setTimeout> | null = null
        let heartbeatTimer: ReturnType<typeof setInterval> | null = null
        let reconnectAttempts = 0
        const MAX_RECONNECT_DELAY = 30000
        const HEARTBEAT_INTERVAL = 30000
        let isManualClose = false

        const getReconnectDelay = () => {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY)
            return delay
        }

        const startHeartbeat = () => {
            if (heartbeatTimer) clearInterval(heartbeatTimer)

            heartbeatTimer = setInterval(() => {
                const socket = wsRef.current
                if (socket && socket.readyState === WebSocket.OPEN) {
                    try {
                        socket.send(JSON.stringify({ type: "ping" }))
                    } catch (error) {
                        console.error("Heartbeat ping failed:", error)
                    }
                }
            }, HEARTBEAT_INTERVAL)
        }

        const stopHeartbeat = () => {
            if (heartbeatTimer) {
                clearInterval(heartbeatTimer)
                heartbeatTimer = null
            }
        }

        const connect = () => {
            if (wsRef.current) {
                isManualClose = true
                wsRef.current.close()
                wsRef.current = null
            }

            const host = process.env.EXPO_PUBLIC_WS_HOST ?? "[IP_ADDRESS]"
            const isLocal = host.includes("localhost") || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(host)
            const protocol = isLocal ? "ws" : "wss"

            console.log(`[WebSocket] Connecting... (attempt ${reconnectAttempts + 1})`)

            const ws = new WebSocket(`${protocol}://${host}/ws/chat/${userID}`)
            wsRef.current = ws
            isManualClose = false

            ws.onopen = () => {
                console.log("[WebSocket] Connected successfully")
                reconnectAttempts = 0
                startHeartbeat()
            }

            ws.onmessage = (e) => {
                let parsed: unknown
                try {
                    parsed = JSON.parse(e.data) as unknown
                } catch {
                    return
                }

                if (isObject(parsed)) {
                    if (parsed["type"] === "ping") {
                        try {
                            ws.send(JSON.stringify({ type: "pong" }))
                        } catch (error) {
                            console.error("Failed to send pong:", error)
                        }
                        return
                    }
                    if (parsed["type"] === "pong") {
                        return
                    }
                }

                const msg = normalizeMessage(parsed)
                if (msg) {
                    const key = `${msg.conversation_id}:${msg.id}`
                    if (seenRef.current.has(key)) return
                    seenRef.current.add(key)

                    applyIncomingMessage(msg, userID)
                    appendMessageToConversation(msg)
                    return
                }

                if (seenRef.current.size > 5000) seenRef.current.clear()

                const rc = normalizeRecall(parsed)
                if (rc) {
                    recallMessageLocal(rc.conversationId, rc.messageId)
                }
            }

            ws.onerror = (error) => {
                console.log("[WebSocket] Error:", error)
            }

            ws.onclose = (event) => {
                console.log(`[WebSocket] Closed (code: ${event.code}, reason: ${event.reason})`)
                wsRef.current = null
                stopHeartbeat()

                if (isManualClose) {
                    console.log("[WebSocket] Manual close, not reconnecting")
                    return
                }
                const delay = getReconnectDelay()
                console.log(`[WebSocket] Reconnecting in ${delay}ms...`)

                reconnectAttempts++
                reconnectTimer = setTimeout(() => {
                    connect()
                }, delay)
            }
        }

        connect()

        const appStateSubscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (nextAppState === "active") {
                console.log("[WebSocket] App became active, checking connection...")
                const socket = wsRef.current
                if (!socket || socket.readyState !== WebSocket.OPEN) {
                    console.log("[WebSocket] Reconnecting due to app state change...")
                    reconnectAttempts = 0
                    connect()
                }
            } else if (nextAppState === "background") {
                console.log("[WebSocket] App went to background")
                stopHeartbeat()
            }
        })

        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {
                console.log("[WebSocket] Network restored, checking connection...")
                const socket = wsRef.current
                if (!socket || socket.readyState !== WebSocket.OPEN) {
                    console.log("[WebSocket] Reconnecting due to network restoration...")
                    reconnectAttempts = 0
                    connect()
                }
            } else {
                console.log("[WebSocket] Network lost")
            }
        })

        return () => {
            console.log("[WebSocket] Cleaning up...")
            isManualClose = true

            if (reconnectTimer) {
                clearTimeout(reconnectTimer)
                reconnectTimer = null
            }

            stopHeartbeat()

            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }

            appStateSubscription.remove()
            unsubscribeNetInfo()
        }
    }, [userID, applyIncomingMessage, appendMessageToConversation, recallMessageLocal])

    return <>{children}</>
}
