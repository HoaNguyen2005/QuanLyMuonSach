import axios from "axios";

export default (baseUrl) => {
    const instance = axios.create({
        baseURL: baseUrl,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    // Request Interceptor: Thêm JWT Token vào Header nếu có
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return instance;
};