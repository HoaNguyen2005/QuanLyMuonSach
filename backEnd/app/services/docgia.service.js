const { ObjectId } = require("mongodb");

class DocGiaService {
    constructor(client) {
        this.DocGia = client.db().collection("docgia");
    }

    extractDocGiaData(payload) {
        const docGia = {
            maDocGia: payload.maDocGia,
            hoTen: payload.hoTen,
            tenTaiKhoan: payload.tenTaiKhoan,
            matKhau: payload.matKhau,
            email: payload.email,
            ngaySinh: payload.ngaySinh,
            gioiTinh: payload.gioiTinh,
            diaChi: payload.diaChi,
            dienThoai: payload.dienThoai,
            trangThaiTaiKhoan: payload.trangThaiTaiKhoan ?? 1
        };

        Object.keys(docGia).forEach(
            (key) => docGia[key] === undefined && delete docGia[key]
        );

        console.log("[DEBUG BACKEND - DocGiaService] Extracted docGia data:", JSON.stringify(docGia, null, 2));
        return docGia;
    }

    async create(payload) {
        console.log("[DEBUG BACKEND - DocGiaService] Creating/Updating docGia with raw payload:", JSON.stringify(payload, null, 2));
        const docGia = this.extractDocGiaData(payload);
        
        const result = await this.DocGia.findOneAndUpdate(
            { maDocGia: docGia.maDocGia },
            { $set: docGia },
            { returnDocument: "after", upsert: true }
        );

        console.log("[DEBUG BACKEND - DocGiaService] Create result from DB:", JSON.stringify(result, null, 2));
        return result;
    }

    async find(filter) {
        console.log("[DEBUG BACKEND - DocGiaService] Finding docGia list with filter:", JSON.stringify(filter));
        const cursor = await this.DocGia.find(filter);
        const documents = await cursor.toArray();
        console.log(`[DEBUG BACKEND - DocGiaService] Found ${documents.length} docGia documents.`);
        return documents;
    }

    async findByMaDocGia(maDocGia) {
        const result = await this.DocGia.findOne({
            $or: [
                { maDocGia: maDocGia },
                { tenTaiKhoan: maDocGia }
            ]
        });
        console.log("[DEBUG BACKEND - DocGiaService] findByMaDocGia result:", JSON.stringify(result, null, 2));
        return result;
    }

    async findByTenTaiKhoan(tenTaiKhoan) {
        console.log(`[DEBUG BACKEND - DocGiaService] Finding docGia by tenTaiKhoan: '${tenTaiKhoan}'`);
        const result = await this.DocGia.findOne({ tenTaiKhoan: tenTaiKhoan });
        console.log("[DEBUG BACKEND - DocGiaService] findByTenTaiKhoan result:", JSON.stringify(result, null, 2));
        return result;
    }

    async update(id, payload) {

        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { maDocGia: id }
            ]
        };

        const updateData = {
            hoTen: payload.hoTen || payload.tenDocGia || payload.tenND,
            email: payload.email,
            ngaySinh: payload.ngaySinh,
            dienThoai: payload.dienThoai || payload.soDienThoai,
            diaChi: payload.diaChi,
            gioiTinh: payload.gioiTinh
        };

        const result = await this.DocGia.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );
        return result;
    }

    async updateAccountStatus(maDocGia, status) {
        console.log(`[DEBUG BACKEND - DocGiaService] Updating status of '${maDocGia}' to ${status}`);
        const result = await this.DocGia.findOneAndUpdate(
            { maDocGia: maDocGia },
            { $set: { trangThaiTaiKhoan: status } },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(maDocGia) {
        console.log(`[DEBUG BACKEND - DocGiaService] Deactivating docGia with maDocGia: '${maDocGia}'`);
        const result = await this.DocGia.findOneAndUpdate(
            { maDocGia: maDocGia },
            { $set: { trangThaiTaiKhoan: 2 } },
            { returnDocument: "after" }
        );
        console.log("[DEBUG BACKEND - DocGiaService] Deactivate result:", JSON.stringify(result, null, 2));
        return result;
    }
    async checkAndLockUser(maDocGia, client) {
        if (!client) return false;
        try {
            const MuonSach = client.db().collection("theodoimuonsach");
            const PhieuPhat = client.db().collection("phieuphat");

            const today = new Date();
            const twentyDaysAgo = new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000);

            // Fetch borrows for this user that were expected to be returned > 20 days ago
            const overdueBorrows = await MuonSach.find({
                maDocGia: maDocGia,
                ngayTraDuKien: { $lt: twentyDaysAgo }
            }).toArray();

            for (const borrow of overdueBorrows) {
                if (borrow.trangThai !== "DA_TRA" && borrow.trangThai !== "ĐÃ TRẢ" && borrow.trangThai !== "ĐÃ_TRẢ") {
                    // Not returned and > 20 days overdue => Lock
                    await this.updateAccountStatus(maDocGia, 3);
                    return true;
                } else {
                    // Returned, but was it late and unpaid?
                    const phieuPhat = await PhieuPhat.findOne({
                        maPhieuMuon: String(borrow._id)
                    });
                    if (phieuPhat && phieuPhat.trangThai !== "DA_THANH_TOAN") {
                        // Unpaid fine for a book that was due > 20 days ago => Lock
                        await this.updateAccountStatus(maDocGia, 3);
                        return true;
                    }
                }
            }
            return false;
        } catch (e) {
            console.error("[DEBUG] Error checking auto lock:", e);
            return false;
        }
    }
}

module.exports = DocGiaService;