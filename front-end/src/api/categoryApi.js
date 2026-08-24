import { API_BASE_URL } from "./apiConfig";

export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories/`);

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    return response.json();
}