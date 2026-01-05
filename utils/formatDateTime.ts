export function formatDateTimeCustom(dateString?: string | Date) {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}, ${day}/${month}/${year}`;
}

export function formatDateOnly(dateString?: string | Date) {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export function formatTimeAgo(dateString?: string | Date) {
    if (!dateString) return "Không có thời gian";

    const oldDate = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - oldDate.getTime()) / 1000;

    if (diff < 60) return `Cập nhật: ${Math.floor(diff)} giây trước`;
    if (diff < 3600) return `Cập nhật: ${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `Cập nhật: ${Math.floor(diff / 3600)} giờ trước`;
    return `Cập nhật: ${Math.floor(diff / 86400)} ngày trước`;
}

export function formatTimeAgoNoUpdate(dateString?: string | Date) {
    if (!dateString) return "Không có thời gian";

    const oldDate = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - oldDate.getTime()) / 1000;

    if (diff < 60) return `${Math.floor(diff)} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

export const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

export const formatDateHeader = (ts: string) =>
    new Date(ts).toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })