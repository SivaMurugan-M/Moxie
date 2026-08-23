const API_URL = "http://127.0.0.1:8000/api";

export async function getCategories() {
    const response = await fetch(`${API_URL}/categories/`);

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    return response.json();
}