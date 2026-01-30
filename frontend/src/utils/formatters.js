// src/utils/formatters.js
export const maskId = (id) => {
    if (!id) return "";
    return id.substring(0, 3) + "***";
};