import { NearbyAmenity } from "@/types/postInfoType";
import api from "@/utils/axios";

export const landlordPost = async (
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
    imageFiles: File[],
    videoFile: File | null | undefined,
    videoLink: string | null | undefined,
    nearby_amenities: NearbyAmenity[],
    postType: string,
    expire: number,
    landlordId: string
) => {
    const formData = new FormData();

    // TEXT FIELDS
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
    formData.append("post_type", postType);
    formData.append("expire_at", expire.toString());
    formData.append("landlord_id", landlordId);

    // OUTSTANDING ARRAY
    outstanding.forEach((item) => {
        formData.append("outstanding", item);
    });

    // IMAGES
    imageFiles.forEach((file) => {
        formData.append("images", file);
    });

    // VIDEO
    if (videoFile) {
        formData.append("video", videoFile);
    }

    // GỬI VỚI FormData → axios tự set multipart + boundary
    const request = await api.post("/api/post/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return request.data;
};


export const updatePost = async (
    id: string,
    oldImages: string[],   // bắt buộc
    oldVideo: string,      // bắt buộc

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
    newImages?: File[],    // optional
    newVideo?: File        // optional
) => {
    const formData = new FormData();

    // ====== FIELD TEXT ======
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

    // ====== ẢNH CŨ GIỮ LẠI ======
    oldImages.forEach((img) => formData.append("old_images", img));

    // ====== ẢNH MỚI ======
    if (newImages && newImages.length > 0) {
        newImages.forEach((file) => formData.append("images", file));
    }

    // ====== VIDEO CŨ ======
    formData.append("old_video", oldVideo || "");

    // ====== VIDEO MỚI ======
    if (newVideo) {
        formData.append("video", newVideo);
    }

    const response = await api.put(`/api/post/update/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};




export const getPostsByLandlordId = async () => {
    const request = await api.get("/api/post/list");
    return request.data.data;
}

export const getPostById = async (id: string) => {
    const request = await api.get(`/api/post/${id}`);
    return request.data.data;
}

export const getPostByIdAdmin = async (id: string) => {
    const request = await api.get(`/api/post/admin/${id}`);
    return request.data.data;
}

export const getPostBySlug = async (slug: string) => {
    const request = await api.get(`/api/post/detail/${slug}`);
    return request.data.data;
}

export const deletePostById = async (id: string) => {
    const response = await api.delete(`/api/post/${id}`);
    return response.data;
};

export const updateRoomNumber = async (id: string, quantityRoom: number) => {
    const res = await api.put(`/api/post/${id}/room-number`, {
        quantity_room: quantityRoom,
    });
    return res.data;
};

export const updateStatus = async (id: string, status: string) => {
    const res = await api.put(`/api/post/${id}/status`, {
        status: status,
    });
    return res.data;
};

export const updatePrivacy = async (id: string, privacy: string) => {
    const res = await api.put(`/api/post/${id}/privacy`, {
        privacy,
    });
    return res.data;
};

export const updateVerification = async (id: string, verification: string) => {
    const res = await api.put(`/api/post/${id}/verification`, {
        verification,
    });
    return res.data;
};

export const getAllPosts = async () => {
    const request = await api.get(`/api/post/`);
    return request.data.data;
}

export const SearchPost = async (
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

    const request = await api.post("/api/post/search", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return request.data;
};

export const getRelatedPosts = async (slug: string) => {
    const request = await api.get(`/api/post/detail/${slug}/related`);
    return request.data.data;
}

export const savePost = async (slug: string) => {
    const request = await api.post(`/api/post/${slug}/saved`);
    return request.data;
};

export const savePostRooms = async (slug: string) => {
    const request = await api.post(`/api/post/${slug}/saved/room-sharing`);
    return request.data;
};


export const getPostsSaved = async () => {
    const request = await api.get(`/api/post/getPost/saved`);
    return request.data;
};

export const getPostsSavedRoomSharing = async () => {
    const request = await api.get(`/api/post/getPost/saved/room-sharing`);
    return request.data;
};



export const get5PostByCategory = async (category: string) => {
    const request = await api.get(`/api/post/get/${category}/room`);
    return request.data;
};

export const get5PostExcludeCategory = async (category: string) => {
    const request = await api.get(`/api/post/get/${category}/room/exclude`);
    return request.data;
};

export const AdminDeletePostById = async (
    id: string,
    postTitle: string,
    nameLandlord: string,
    emailLandlord: string,
    reason: string
) => {
    const response = await api.post(`/api/post/admin/delete/${id}`, {
        postTitle,
        nameLandlord,
        emailLandlord,
        reason,
    });
    return response.data;
};


export const UploadOrUpdatePanorama = async (
    id: string,
    file: File
) => {
    const formData = new FormData();
    formData.append("file", file);

    const request = await api.put(
        `/api/post/${id}/picture-360`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return request.data;
};


export const DeletePanorama = async (id: string) => {
    const request = await api.delete(`/api/post/${id}/picture-360`);
    return request.data;
};