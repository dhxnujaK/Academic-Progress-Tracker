import axios from "axios";

const API_BASE =
    // Vite
    (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE) ||
    // CRA
    (typeof process !== "undefined" &&
        process.env &&
        process.env.REACT_APP_API_BASE) ||
    // Default
    "http://localhost:8080/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // These headers are optional; keep them only if you need to defeat caches
    // config.headers["Cache-Control"] = "no-cache";
    // config.headers["Pragma"] = "no-cache";
    // config.headers["Expires"] = "0";

    return config;
});

export default api;