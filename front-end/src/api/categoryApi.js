import { API_URL } from "../config";

export async function getCategories() {
    const response = await fetch(`${API_URL}/categories/`);

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    return response.json();
}