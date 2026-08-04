import createApiClient from "./api.service";

class DocGiaService {
    constructor(baseUrl = "/api/docgia") {
        this.api = createApiClient(baseUrl);
    }

    async getAll() {
        const response = await this.api.get("/");
        return response.data;
    }

    async get(id) {
        const response = await this.api.get(`/${id}`);
        return response.data;
    }

    async create(data) {
        const response = await this.api.post("/register", data);
        return response.data;
    }

    async update(id, data) {
        const response = await this.api.put(`/${id}`, data);
        return response.data;
    }

    async delete(id) {
        const response = await this.api.delete(`/${id}`);
        return response.data;
    }

    async toggleLock(id, status) {
        const response = await this.api.put(`/${id}/lock`, { status });
        return response.data;
    }
}

export default new DocGiaService();