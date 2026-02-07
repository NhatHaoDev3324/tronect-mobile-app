export const getPaymentStatusInfo = (status: string) => {
    const s = status?.trim().toLowerCase();
    const map: Record<
        string,
        { label: string; bgColor: string; textColor: string; borderColor: string }
    > = {
        pending: {
            label: "Chờ xử lý",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-700",
            borderColor: "border-yellow-200",
        },
        processing: {
            label: "Đang xử lý",
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            borderColor: "border-blue-200",
        },
        success: {
            label: "Thành công",
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            borderColor: "border-green-200",
        },
        paid: {
            label: "Đã thanh toán",
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            borderColor: "border-green-200",
        },
        canceled: {
            label: "Đã hủy",
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            borderColor: "border-red-200",
        },
        failed: {
            label: "Thất bại",
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            borderColor: "border-red-200",
        },
        expired: {
            label: "Hết hạn",
            bgColor: "bg-gray-100",
            textColor: "text-gray-600",
            borderColor: "border-gray-200",
        },
    };

    return (
        map[s] || {
            label: status || "Không xác định",
            bgColor: "bg-gray-50",
            textColor: "text-gray-600",
            borderColor: "border-gray-200",
        }
    );
};
