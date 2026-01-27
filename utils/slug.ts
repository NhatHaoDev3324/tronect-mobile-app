export function stringToSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
        .replace(/[^a-z0-9\s]/g, "")    // bỏ ký tự đặc biệt
        .trim()
        .replace(/\s+/g, "_");          // khoảng trắng → _
};
