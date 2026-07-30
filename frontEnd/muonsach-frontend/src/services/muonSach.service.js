import createApiClient from "./api.service";

class MuonSachService {
    constructor(baseUrl = "/api/muon-sach") {
        this.api = createApiClient(baseUrl);
    }

    async getAll() {
        const res = await this.api.get("/");
        return res.data;
    }

    async create(data) {
        const res = await this.api.post("/", data);
        return res.data;
    }

    async traSach(id, data) {
        const res = await this.api.put(`/${id}/tra-sach`, data);
        return res.data;
    }

    async getLichSuByDocGia(maDocGia) {
        const res = await this.api.get(`/docgia/${maDocGia}`);
        return res.data;
    }

    async updateStatus(id, trangThai) {
        const res = await this.api.put(`/${id}/trang-thai`, { trangThai });
        return res.data;
    }

    async duyetMuon(id) {
        return await this.updateStatus(id, "DA_DUYET");
    }

    async tuChoiMuon(id) {
        return await this.updateStatus(id, "TU_CHOI");
    }
}

export default new MuonSachService();