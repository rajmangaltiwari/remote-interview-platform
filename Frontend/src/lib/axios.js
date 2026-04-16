import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})

// Attach Clerk session token to every request
axiosInstance.interceptors.request.use(async (config) => {
    try {
        // window.Clerk is available after ClerkProvider initializes
        const token = await window.Clerk?.session?.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("[axios] Failed to get Clerk token:", error);
    }
    return config;
});

export default axiosInstance;