import { RoleType } from "./authType";

export type NearbyAmenity = {
    name: string;
    distance: number;
    unit_distance: "km" | "m";
};

export interface PostInfoType {
    stt: number;
    id: string;
    category: string;
    province: string;
    district: string;
    ward: string;
    slug_ward: string;
    street: string;
    houseNumber: string;
    address: string;
    lat: number;
    lng: number;
    title: string;
    slug: string;
    description: string;
    quantity_room: string;
    price: number;
    unit: string;
    acreage: string;
    privacy: string;
    saved: string[];
    outstanding: string[];
    images: string[];
    video: string;
    video_link: string;
    nearby_amenities: NearbyAmenity[];
    report: string[];
    created_at: Date;
    expire_at: Date;
    updated_at: Date;
    status: string;
    post_type: string;
    verification_status: string;
    picture_360: string;
    tour_360: string;
    landlord_id: string;
    landlord: {
        id: string;
        email: string;
        username: string;
        phone: string;
        role: RoleType;
        picture: string;
        zalo: string;
        bio: string;
    },
    tenant_id: string;
    tenant: {
        id: string;
        email: string;
        username: string;
        phone: string;
        role: RoleType;
        picture: string;
        zalo: string;
        bio: string;
    }
}