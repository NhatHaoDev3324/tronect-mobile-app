import { getPricing } from "@/api/pricingApi"
import { create } from "zustand"

export type PostType = "normal" | "vip"

interface PricingConfigState {
    id: string
    loading: boolean
    isPaymentEnabled: boolean

    expireDays: string
    defaultPostType: PostType

    postPriceDay: string
    postPriceWeek: string
    postPriceMonth: string

    postTypeVipPrice: string

    renewDay: string
    renewWeek: string
    renewMonth: string

    renewVipPrice: string

    picPrice: string
    videoPrice: string

    setField: <K extends keyof PricingConfigState>(
        key: K,
        value: PricingConfigState[K]
    ) => void
    fetchPricing: () => Promise<void>
}

export const usePricingConfigStore = create<PricingConfigState>((set) => ({
    id: "",
    loading: false,
    isPaymentEnabled: true,

    expireDays: "7",
    defaultPostType: "normal",

    postPriceDay: "0",
    postPriceWeek: "0",
    postPriceMonth: "0",

    postTypeVipPrice: "0",

    renewDay: "0",
    renewWeek: "0",
    renewMonth: "0",

    renewVipPrice: "0",

    picPrice: "0",
    videoPrice: "0",

    setField: (key, value) =>
        set((state) => ({
            ...state,
            [key]: value,
        })),

    fetchPricing: async () => {
        set({ loading: true })
        try {
            const data = await getPricing()
            if (data) {
                set({
                    id: data.id,
                    isPaymentEnabled: data.is_payment_enabled,
                    expireDays: String(data.expire_days),
                    defaultPostType: data.default_post_type,
                    postPriceDay: String(data.post_price_day),
                    postPriceWeek: String(data.post_price_week),
                    postPriceMonth: String(data.post_price_month),
                    postTypeVipPrice: String(data.post_type_vip_price),
                    renewDay: String(data.renew_day),
                    renewWeek: String(data.renew_week),
                    renewMonth: String(data.renew_month),
                    renewVipPrice: String(data.renew_vip_price),
                    picPrice: String(data.pic_price),
                    videoPrice: String(data.video_price),
                })
            }
        } catch (error) {
            console.error("Error fetching pricing config:", error)
        } finally {
            set({ loading: false })
        }
    },
}))
