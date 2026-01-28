export function getOpenStatusUI(timeRange: string) {
    const [open, close] = timeRange.includes("-")
        ? timeRange.split("-").map(s => s.trim())
        : [];

    const toMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let isOpen = false;

    if (open && close) {
        const openMin = toMinutes(open);
        const closeMin = toMinutes(close);

        if (openMin < closeMin) {
            isOpen = nowMinutes >= openMin && nowMinutes < closeMin;
        } else {
            isOpen = nowMinutes >= openMin || nowMinutes < closeMin;
        }
    }

    return {
        isOpen,
        label: isOpen ? "Đang mở cửa" : "Đã đóng cửa",
        style: {
            backgroundColor: isOpen ? "#10b981" : "#6b7280",
        },
    };
}
