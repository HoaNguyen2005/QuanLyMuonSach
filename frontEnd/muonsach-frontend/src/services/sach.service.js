import createApiClient from "./api.service";

class SachService {
    constructor(baseUrl = "/api/sach") {
        this.api = createApiClient(baseUrl);
    }

    async getAll() {
        console.log("[DEBUG FRONTEND - SachService] Fetching all books...");
        const response = await this.api.get("/");
        console.log("[DEBUG FRONTEND - SachService] Books fetched count:", response.data?.length || 0);
        return response.data;
    }

    async get(id) {
        console.log(`[DEBUG FRONTEND - SachService] Fetching book by ID: ${id}`);
        const response = await this.api.get(`/${id}`);
        return response.data;
    }

    async create(data) {
        console.log("[DEBUG FRONTEND - SachService] Creating book payload:", JSON.stringify(data, null, 2));
        const response = await this.api.post("/", data);
        return response.data;
    }

    async update(id, data) {
        console.log(`[DEBUG FRONTEND - SachService] Updating book ID '${id}' payload:`, JSON.stringify(data, null, 2));
        const response = await this.api.put(`/${id}`, data);
        return response.data;
    }

    async delete(id) {
        console.log(`[DEBUG FRONTEND - SachService] Deleting book ID: ${id}`);
        const response = await this.api.delete(`/${id}`);
        return response.data;
    }
}

export default new SachService();