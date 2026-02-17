import { NearbyAmenity } from "@/types/postInfoType";
import api from "@/utils/axios";
import * as ImagePicker from "expo-image-picker";

export const tenantPostRoomSharing = async (
    category: string,
    province: string,
    district: string,
    ward: string,
    street: string,
    houseNumber: string,
    address: string,
    lat: number,
    lng: number,
    title: string,
    description: string,
    price: number,
    unit: string,
    acreage: string,
    quantityRoom: number,
    outstanding: string[],
    imageFiles: ImagePicker.ImagePickerAsset[],
    videoFile: ImagePicker.ImagePickerAsset | null,
    videoLink: string | null | undefined,
    nearby_amenities: NearbyAmenity[],
    tenantId: string
) => {
    const formData = new FormData();

    formData.append("category", category);
    formData.append("province", province);
    formData.append("district", district);
    formData.append("ward", ward);
    formData.append("street", street);
    formData.append("house_number", houseNumber);
    formData.append("address", address);
    formData.append("lat", lat.toString());
    formData.append("lng", lng.toString());
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("unit", unit);
    formData.append("acreage", acreage);
    formData.append("quantity_room", quantityRoom.toString());
    formData.append("video_link", videoLink || "");
    formData.append("nearby_amenities", JSON.stringify(nearby_amenities));
    formData.append("tenant_id", tenantId);

    outstanding.forEach((item) => {
        formData.append("outstanding", item);
    });

    imageFiles.forEach((img, index) => {
        formData.append("images", {
            uri: img.uri,
            name: `image_${index}.jpg`,
            type: img.mimeType || "image/jpeg",
        } as any);
    });


    if (videoFile) {
        formData.append("video", {
            uri: videoFile.uri,
            name: "video.mp4",
            type: videoFile.mimeType || "video/mp4",
        } as any);
    }

    const request = await api.post("/api/post/room_share/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return request.data;
};

export const updatePostRoomSharing = async (
    id: string,
    oldImages: string[],
    oldVideo: string,

    category?: string,
    province?: string,
    district?: string,
    ward?: string,
    street?: string,
    houseNumber?: string,
    address?: string,
    lat?: string,
    lng?: string,
    title?: string,
    description?: string,
    unit?: string,
    acreage?: string,
    videoLink?: string,
    outstanding?: string[],
    quantityRoom?: number,
    price?: number,
    nearbyAmenities?: NearbyAmenity[],
    newImages?: ImagePicker.ImagePickerAsset[],
    newVideo?: ImagePicker.ImagePickerAsset | null
) => {
    const formData = new FormData();

    if (category) formData.append("category", category);
    if (province) formData.append("province", province);
    if (district) formData.append("district", district);
    if (ward) formData.append("ward", ward);
    if (street) formData.append("street", street);
    if (houseNumber) formData.append("house_number", houseNumber);
    if (address) formData.append("address", address);
    if (lat) formData.append("lat", lat);
    if (lng) formData.append("lng", lng);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (unit) formData.append("unit", unit);
    if (acreage) formData.append("acreage", acreage);
    if (videoLink) formData.append("video_link", videoLink);

    if (outstanding && outstanding.length > 0) {
        outstanding.forEach((o) => formData.append("outstanding", o));
    }

    if (quantityRoom !== undefined)
        formData.append("quantity_room", String(quantityRoom));

    if (price !== undefined)
        formData.append("price", String(price));

    if (nearbyAmenities)
        formData.append("nearby_amenities", JSON.stringify(nearbyAmenities));

    oldImages?.forEach((img) => formData.append("old_images", img));

    newImages?.forEach((img, index) => {
        formData.append("images", {
            uri: img.uri,
            name: `image_${index}.jpg`,
            type: img.mimeType || "image/jpeg",
        } as any);
    });

    formData.append("old_video", oldVideo || "");

    if (newVideo) {
        formData.append("video", {
            uri: newVideo.uri,
            name: "video.mp4",
            type: newVideo.mimeType || "video/mp4",
        } as any);
    }

    const response = await api.put(`/api/post/room_share/update/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};


export const getPostsRoomSharingByTenantId = async () => {
    const request = await api.get("/api/post/room_share/list");
    return request.data.data;
}

export const getPostRoomSharingById = async (id: string) => {
    const request = await api.get(`/api/post/room_share/${id}`);
    return request.data.data;
}

export const getPostRoomSharingByIdAdmin = async (id: string) => {
    const request = await api.get(`/api/post/room_share/admin/${id}`);
    return request.data.data;
}

export const getPostRoomSharingBySlug = async (slug: string) => {
    const request = await api.get(`/api/post/room_share/detail/${slug}`);
    return request.data.data;
}

export const deletePostRoomSharingById = async (id: string) => {
    const response = await api.delete(`/api/post/room_share/${id}`);
    return response.data;
};

export const updateRoomSharingNumber = async (id: string, quantityRoom: number) => {
    const res = await api.put(`/api/post/room_share/${id}/room-number`, {
        quantity_room: quantityRoom,
    });
    return res.data;
};

export const updateRoomSharingStatus = async (id: string, status: string) => {
    const res = await api.put(`/api/post/room_share/${id}/status`, {
        status: status,
    }, { timeout: 3000 });
    return res.data;
};

export const updatePrivacyPostRoomSharing = async (id: string, privacy: string) => {
    const res = await api.put(`/api/post/room_share/${id}/privacy`, {
        privacy,
    }, { timeout: 3000 });
    return res.data;
};

export const getAllPostRoomSharing = async () => {
    const request = await api.get(`/api/post/room_share/`);
    return request.data.data;
}

export const SearchPostRoomSharing = async (
    lease: string,
    district: string,
    ward: string,
    order: string,
    priceFrom: string,
    priceTo: string,
    areaFrom: string,
    areaTo: string,
    features: string[],
) => {
    const formData = new FormData();
    formData.append("lease", lease);
    formData.append("slugDistrict", district);
    formData.append("slugWard", ward);
    formData.append("order", order);
    formData.append("gia_tu", priceFrom);
    formData.append("gia_den", priceTo);
    formData.append("dien_tich_tu", areaFrom);
    formData.append("dien_tich_den", areaTo);

    features.forEach((item) => {
        formData.append("features", item);
    });

    const request = await api.post("/api/post/room_share/search", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return request.data;
};

export const getRelatedPostRoomSharing = async (slug: string) => {
    const request = await api.get(`/api/post/room_share/detail/${slug}/related`);
    return request.data.data;
}

export const savePostRoomSharing = async (slug: string) => {
    const request = await api.post(`/api/post/room_share/${slug}/saved`);
    return request.data;
};

// export const savePostRoomSharing = async (slug: string) => {
//     const request = await api.post(`/api/post/room_share/${slug}/saved/room-sharing`);
//     return request.data;
// };


export const getPostsRoomSharingSaved = async () => {
    const request = await api.get(`/api/post/room_share/getPost/saved`);
    return request.data;
};

// export const getPostsSavedRoomSharing = async () => {
//     const request = await api.get(`/api/post/room_share/getPost/saved/room-sharing`);
//     return request.data;
// };



export const get5PostRoomSharingByCategory = async (category: string) => {
    const request = await api.get(`/api/post/room_share/get/${category}/room`);
    return request.data;
};

// export const get5PostRoomSharingExcludeCategory = async (category: string) => {
//     const request = await api.get(`/api/post/room_share/get/${category}/room/exclude`);
//     return request.data;
// };

export const AdminDeletePostRoomSharingById = async (
    id: string,
    postTitle: string,
    nameTenant: string,
    emailTenant: string,
    reason: string
) => {
    const response = await api.post(`/api/post/room_share/admin/delete/${id}`, {
        postTitle,
        nameTenant,
        emailTenant,
        reason,
    });
    return response.data;
};
