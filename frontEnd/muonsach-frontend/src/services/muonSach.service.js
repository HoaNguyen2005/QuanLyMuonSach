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

    async updateStatus(id, trangThai, extraData = {}) {
        const payload = { trangThai, ...extraData };
        const res = await this.api.put(`/${id}/trang-thai`, payload);
        return res.data;
    }

    async duyetMuon(id, extraData = {}) {
        return await this.updateStatus(id, "DA_DUYET", extraData);
    }

    async tuChoiMuon(id, extraData = {}) {
        return await this.updateStatus(id, "TU_CHOI", extraData);
    }

    async giaHan(id) {
        const res = await this.api.put(`/${id}/gia-han`);
        return res.data;
    }
}

export default new MuonSachService();