import {PostType} from "@/store/pricing-config.store";

export type pricingType = {
    id: string;
    is_payment_enabled: boolean;

    expire_days: number;
    default_post_type: PostType;

    post_price_day: number;
    post_price_week: number;
    post_price_month: number;

    post_type_vip_price: number;

    renew_day: number;
    renew_week: number;
    renew_month: number;

    renew_vip_price: number;

    pic_price: number;
    video_price: number;
}