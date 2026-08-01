import createApiClient from "./api.service"; // Hoặc axios client của dự án bạn

class PhieuPhatService {
  constructor(baseUrl = "/api/phieu-phat") {
    this.api = createApiClient(baseUrl);
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async approve(id, data = {}) {
    return (await this.api.put(`/${id}/approve`, data)).data;
  }
}

export default new PhieuPhatService();