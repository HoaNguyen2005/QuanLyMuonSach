import createApiClient from "./api.service";

class NhaXuatBanService {
    constructor(baseUrl = "/api/nhaxuatban") { // Đã khớp 100% với backend
        this.api = createApiClient(baseUrl);
    }

    async getAll() {
        console.log("[DEBUG FRONTEND - NhaXuatBanService] Fetching all publishers from /api/nhaxuatban...");
        const response = await this.api.get("/");
        console.log("[DEBUG FRONTEND - NhaXuatBanService] Publishers count fetched:", response.data?.length || 0);
        return response.data;
    }

    async create(data) {
        console.log("[DEBUG FRONTEND - NhaXuatBanService] Creating publisher payload:", JSON.stringify(data, null, 2));
        const response = await this.api.post("/", data);
        return response.data;
    }

    async update(id, data) {
        console.log(`[DEBUG FRONTEND - NhaXuatBanService] Updating publisher '${id}' payload:`, JSON.stringify(data, null, 2));
        const response = await this.api.put(`/${id}`, data);
        return response.data;
    }

    async delete(id) {
        console.log(`[DEBUG FRONTEND - NhaXuatBanService] Deleting publisher: ${id}`);
        const response = await this.api.delete(`/${id}`);
        return response.data;
    }
}

export default new NhaXuatBanService();