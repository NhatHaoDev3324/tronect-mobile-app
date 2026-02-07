import api from "@/utils/axios";

import { pricingType } from "@/types/pricingType";

export const getPricing = async () => {
    const request = await api.get("/api/pricing-config/");
    return request.data.data;
}
export const updatePricing = async (payload: pricingType) => {
    const res = await api.put("/api/pricing-config/", payload);
    return res.data;
};

export const togglePayment = async (enabled: boolean, id: string) => {
    const res = await api.put("/api/pricing-config/toggle-payment", {
        id: id,
        is_payment_enabled: enabled,
    });
    return res.data;
};
