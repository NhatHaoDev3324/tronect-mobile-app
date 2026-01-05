import api from "@/utils/axios";

export const tenantLoginWithEmail = async (email: string, password: string) => {
    const request  = await api.post("/api/tenant/login/email", {email, password});
    return request.data;
}

export const tenantMyProfile = async () => {
    const request  = await api.get("/api/tenant/profile");
    return request.data;
}