import createApiClient from "./api.service";

class AuthService {
    constructor(baseUrl = "/api/auth") {
        this.api = createApiClient(baseUrl);
    }

    // Đăng nhập (Dùng chung cho Độc Giả và Admin)
    async login(credentials) {
        console.log("[DEBUG FRONTEND - AuthService] Logging in user:", credentials.username);
        const response = await this.api.post("/login", credentials);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            console.log("[DEBUG FRONTEND - AuthService] Token & User saved to localStorage.");
        }
        return response.data;
    }

    // Đăng ký tài khoản Độc Giả
    async register(data) {
        console.log("[DEBUG FRONTEND - AuthService] Registering new reader:", data.maDocGia);
        const response = await this.api.post("/register", data);
        return response.data;
    }

    // Đăng xuất
    logout() {
        console.log("[DEBUG FRONTEND - AuthService] Logging out user...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    // Lấy thông tin user hiện tại từ localStorage
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem("user");
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error("[DEBUG FRONTEND - AuthService] Error parsing user from localStorage:", error);
            return null;
        }
    }

    // Lấy Token
    getToken() {
        return localStorage.getItem("token");
    }
}

export default new AuthService();