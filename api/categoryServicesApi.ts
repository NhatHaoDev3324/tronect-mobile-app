import api from "@/utils/axios";


export const getAllCategoryServices = async () => {
  const response = await api.get("/api/category-services");
  return response.data.data;
};
