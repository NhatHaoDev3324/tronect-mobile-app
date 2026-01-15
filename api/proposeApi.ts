import api from "@/utils/axios";

export const getAllPostsPropose = async () => {
    const response = await api.get(`/api/propose/posts`);
    return response.data;
};
