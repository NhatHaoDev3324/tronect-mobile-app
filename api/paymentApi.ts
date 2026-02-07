import api from "@/utils/axios";

export const createPayment = async (product_name: string, product_package:string, amount: number) => {
    const response = await api.post(`/api/payments/create`, {
        product_name,
        product_package,
        amount,
    });
    return response.data;
};

export const getAllPayments = async () => {
    const response = await api.get(`/api/payments/`);
    return response.data;
};

export const getPaymentsByLandlord = async () => {
    const response = await api.get(`/api/payments/landlord`);
    return response.data;
};

export const updatePaymentStatus = async (id: string, status: string) => {
    const response = await api.patch(`/api/payments/${id}/status`, {
        status,
    });
    return response.data;
};

export const updatePaymentStatusByOrderCode = async (oc: number, status: string,expiry :string, postType: string ) => {
    const response = await api.patch(`/api/payments/orderCode/update/status`, {
        oc,
        status,
        expiry,
        postType,
    });
    return response.data;
};

export const updatePaymentStatusByOrderCodeAndPost = async (oc: number, status: string,expiry :string, postType: string, postId: string ) => {
    const response = await api.patch(`/api/payments/update-status-and-post`, {
        oc,
        status,
        expiry,
        postType,
        postId
    });
    return response.data;
};

export const deletePayment = async (id: string) => {
    const response = await api.delete(`/api/payments/${id}`);
    return response.data;
};
