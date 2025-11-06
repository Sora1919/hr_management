import axios from "axios";
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
})

const storage = {
    getToken: () => {
        try {
            if (typeof window !== "undefined") {
                return localStorage.getItem("token");
            }
            return null;
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return null;
        }
    },
    setToken: (token: string) => {
        try {
            if (typeof window !== "undefined") {
                localStorage.setItem("token", token);
            }
        } catch (error) {
            console.error("Error setting token in localStorage:", error);
        }
    },
    removeToken: () => {
        try {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
            }
        } catch (error) {
            console.error("Error removing token from localStorage:", error);
        }
    }
};


// ✅ Automatically attach token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("No token found in localStorage");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            storage.removeToken();
            // Redirect to login page if needed
            if (typeof window !== "undefined") {
                window.location.href = "/auth";
            }
        }
        return Promise.reject(error);
    }
);