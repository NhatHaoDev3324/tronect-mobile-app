export type FAQAudience = "tenant" | "landlord"

export interface FAQType {
    id: string
    question: string
    answer: string
    audience: FAQAudience
    is_public: boolean
    created_at: string
    updated_at: string
}
