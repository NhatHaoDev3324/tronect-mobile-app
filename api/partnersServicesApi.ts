import api from "@/utils/axios";

export const createPartnerService = async (data: {
  image: File;
  category: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  houseNumber: string;
  lat: string;
  lng: string;
  title: string;
  description: string;
  name: string;
  phone: string;
  zalo: string;
  workingHours: string;
  status: string;
  priceNote: string;
}) => {
  const formData = new FormData();

  formData.append("category", data.category);
  formData.append("address", data.address);
  formData.append("province", data.province);
  formData.append("district", data.district);
  formData.append("ward", data.ward);
  formData.append("street", data.street);
  formData.append("house_number", data.houseNumber);
  formData.append("lat", data.lat);
  formData.append("lng", data.lng);
  formData.append("image", data.image);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("name", data.name)
  formData.append("phone", data.phone);
  formData.append("zalo", data.zalo);
  formData.append("working_hours", data.workingHours);
  formData.append("status", data.status);
  formData.append("price_note", data.priceNote);

  const response = await api.post("/api/partner-services/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getByIDPartnerService = async (id: string) => {
  const response = await api.get(`/api/partner-services/get-by-id/${id}`);
  return response.data.data;
};

export const getAllPartnerService = async () => {
  const response = await api.get("/api/partner-services/get-all");
  return response.data.data;
};

export const deletePartnerService = async (id: string) => {
  const response = await api.delete(`/api/partner-services/delete-by-id/${id}`);
  return response.data;
};

export const updatePartnerService = async (
  id: string,
  data: {
    image?: File | null;
    category: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    houseNumber: string;
    lat: string;
    lng: string;
    title: string;
    description: string;
    name: string;
    phone: string;
    zalo: string;
    workingHours: string;
    status: string;
    priceNote: string;
  }
) => {
  const formData = new FormData();

  if (data.image) formData.append("image", data.image);
  if (data.category) formData.append("category", data.category);
  if (data.address) formData.append("address", data.address);
  if (data.province) formData.append("province", data.province);
  if (data.district) formData.append("district", data.district);
  if (data.ward) formData.append("ward", data.ward);
  if (data.street) formData.append("street", data.street);
  if (data.houseNumber) formData.append("house_number", data.houseNumber);
  if (data.lat) formData.append("lat", data.lat);
  if (data.lng) formData.append("lng", data.lng);
  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.name) formData.append("name", data.name)
  if (data.phone) formData.append("phone", data.phone);
  if (data.zalo) formData.append("zalo", data.zalo);
  if (data.workingHours) formData.append("working_hours", data.workingHours);
  if (data.status) formData.append("status", data.status);
  if (data.priceNote) formData.append("price_note", data.priceNote);

  const response = await api.put(`/api/partner-services/update-by-id/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const SearchAllPartnerService = async (category: string, province: string, district: string, ward: string) => {
  const response = await api.post("/api/partner-services/search", { category, province, district, ward });
  return response.data.data;
};