import api from "@/utils/axios";

export const createReport = async (
    postId: string,
    reporterName: string,
    reporterPhone: string,
    reason: string,
    description: string
) => {
    const request = await api.post("/api/report/create", {
        postId,
        reporterName,
        reporterPhone,
        reason,
        description,
    });
    return request.data;
};
