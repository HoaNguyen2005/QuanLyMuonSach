import createApiClient from "./api.service";

class NhanVienService {
    constructor(baseUrl = "/api/nhanvien") {
        this.api = createApiClient(baseUrl);
    }

    async getAll() {
        console.log("[DEBUG FRONTEND - NhanVienService] Fetching all staff...");
        const response = await this.api.get("/");
        console.log("[DEBUG FRONTEND - NhanVienService] Staff fetched count:", response.data?.length || 0);
        return response.data;
    }

    async create(data) {
        console.log("[DEBUG FRONTEND - NhanVienService] Creating staff payload:", JSON.stringify(data, null, 2));
        const response = await this.api.post("/", data);
        return response.data;
    }

    async update(id, data) {
        console.log(`[DEBUG FRONTEND - NhanVienService] Updating staff MSNV '${id}' payload:`, JSON.stringify(data, null, 2));
        const response = await this.api.put(`/${id}`, data);
        return response.data;
    }

    async delete(id) {
        console.log(`[DEBUG FRONTEND - NhanVienService] Deleting staff MSNV: ${id}`);
        const response = await this.api.delete(`/${id}`);
        return response.data;
    }
}

export default new NhanVienService();