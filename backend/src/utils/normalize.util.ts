export function normalizeString(value: string){
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^0-9a-zA-Z\s]/g, "")
        .trim()
        .toLowerCase();
}

