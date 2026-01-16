import { FAQAudience, FAQType } from "@/types/faqType";
import api from "@/utils/axios";


export const getAllFaq = async (): Promise<FAQType[]> => {
    const res = await api.get("/api/faq/")
    return res.data.data
}

export const getShowFaq = async (): Promise<FAQType[]> => {
    const res = await api.get("/api/faq/showFAQ")
    return res.data.data
}

export const getFaqByAudience = async (
    audience: FAQAudience
): Promise<FAQType[]> => {
    const res = await api.get(`/api/faq/${audience}`)
    return res.data.data
}

export const getTenantFaq = () => getFaqByAudience("tenant")
export const getLandlordFaq = () => getFaqByAudience("landlord")


export const createFaq = async (payload: {
    question: string
    answer: string
    audience: "tenant" | "landlord"
    is_public: boolean
}) => {
    const res = await api.post("/api/faq/", payload)
    return res.data
}

export const updateFaq = async (payload: {
    id: string
    question: string
    answer: string
    audience: "tenant" | "landlord"
    is_public: boolean
}) => {
    const res = await api.put("/api/faq/", payload)
    return res.data
}

export const deleteFaq = async (id: string) => {
    const res = await api.delete(`/api/faq/${id}`)
    return res.data
}

export const toggleFaqPublic = async (id: string, isPublic: boolean) => {
    const res = await api.put(`/api/faq/${id}/toggle`, {
        is_public: isPublic,
    })
    return res.data
}
