export type RoleType = "admin" | "tenant" | "landlord" | "user";

export type GenderType = "male" | "female" | "gay" | "les" | "other" | "no_share" | "not_provided";

export interface AdminInfoType {
    id: string;
    username: string;
    email: string;
    phone: string;
    role: RoleType,
    picture: string;
    provider: string;
    gender: GenderType;
    date_of_birth: Date | undefined;
    bio: string;
    zalo: string;
    created_at: string  | Date;
    updated_at: string  | Date;
}

export interface LandlordInfoType {
    id: string;
    username: string;
    email: string;
    phone: string;
    role: RoleType,
    picture: string;
    provider: string;
    gender: GenderType;
    date_of_birth: Date | undefined;
    bio: string;
    zalo: string;
    created_at: string | Date;
    updated_at: string | Date;
}

export interface TenantInfoType {
    id: string;
    username: string;
    email: string;
    phone: string;
    role: RoleType,
    picture: string;
    provider: string;
    gender: GenderType;
    date_of_birth: Date | undefined;
    bio: string;
    zalo: string;
    created_at: string | Date;
    updated_at: string | Date;
}

export interface UserInfoType {
    stt?: number;
    id: string;
    username: string;
    email: string;
    phone: string;
    role: RoleType,
    picture: string;
    provider: string;
    gender: GenderType;
    date_of_birth: Date | undefined;
    bio: string;
    zalo: string;
    created_at: string | Date;
    updated_at: string | Date;
}
