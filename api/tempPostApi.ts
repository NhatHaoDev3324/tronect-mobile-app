import api from "@/utils/axios";

export const createTempPost = async (formData: FormData) => {
    const res = await api.post("/api/landlord/posts/temp", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data.tempPostId;
};

export const getTempPost = async (tempPostId: string) => {
    const res = await api.get(`/api/landlord/posts/temp/${tempPostId}`);
    return res.data.data;
};

export const publishPost = async (tempPostId: string, expiry: string, postType: string) => {
    const res = await api.post(`/api/landlord/posts/temp/${tempPostId}/publish`, {
        expiry,
        postType,
    });
    return res.data;
};
