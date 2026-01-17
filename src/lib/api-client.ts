const isProd = import.meta.env.PROD;
const API_BASE_URL = isProd ? "https://app.platformx.com.br/api" : "/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Erro na requisição");
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

export const setAuthToken = (token: string) => {
    localStorage.setItem('auth_token', token);
};

export const removeAuthToken = () => {
    localStorage.removeItem('auth_token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('auth_token');
};
