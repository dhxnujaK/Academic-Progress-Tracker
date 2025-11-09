import axios from "axios";

const sanitizeBase = (value) => {
    if (!value || typeof value !== "string") return null;
    return value.replace(/\s+/g, "").replace(/\/+$/, "");
};

const detectedBase =
    (typeof import.meta !== "undefined" &&
        import.meta.env &&
        (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) ||
    (typeof process !== "undefined" &&
        process.env &&
        (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE)) ||
    null;

const envBase = sanitizeBase(detectedBase);

const deploymentBase = (() => {
    if (typeof window === "undefined") return null;
    const host = window.location.hostname;
    if (!host) return null;
    if (host.includes("netlify.app")) {
        return "https://trackmate-b8ae76ec6b01.herokuapp.com";
    }
    return null;
})();

const API_ORIGIN = envBase || deploymentBase || "http://localhost:8080";
const API_BASE_URL = `${API_ORIGIN}/api`;

export const apiOrigin = API_ORIGIN;
export const apiBaseUrl = API_BASE_URL;

export const resolveApiPath = (path = "") => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

 

    return config;
});

export default api;
