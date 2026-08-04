const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
    constructor(client) {
        this.MuonSach = client.db().collection("theodoimuonsach");
    }

    async create(payload) {
        const ngayMuon = payload.ngayMuon ? new Date(payload.ngayMuon) : new Date();
        let ngayTraDuKien = payload.ngayTraDuKien ? new Date(payload.ngayTraDuKien) : new Date(ngayMuon);
        
        const maxReturnDate = new Date(ngayMuon);
        maxReturnDate.setDate(maxReturnDate.getDate() + 7);
        
        if (ngayTraDuKien > maxReturnDate) {
            ngayTraDuKien = maxReturnDate;
        } else if (ngayTraDuKien < ngayMuon) {
            ngayTraDuKien = new Date(ngayMuon);
        }


        const record = {
            maDocGia: String(payload.maDocGia),
            maSach: String(payload.maSach),
            MSNV: payload.MSNV || null, 
            ngayMuon: ngayMuon,
            ngayTraDuKien: ngayTraDuKien,
            ngayTraThucTe: null,
            soLanGiaHan: 0,
            trangThai: payload.trangThai || "CHO_DUYET",
            created_at: new Date()
        };

        console.log("[DEBUG SERVICE - Document sẽ lưu vào MongoDB]:", JSON.stringify(record, null, 2));
        const result = await this.MuonSach.insertOne(record);
        console.log(`[DEBUG SERVICE SUCCESS] Đã lưu phiếu mượn thành công với InsertedID: ${result.insertedId}`);

        return { _id: result.insertedId, ...record };
    }

    async findAll() {
        console.log("[DEBUG SERVICE - TheoDoiMuonSachService] Fetching ALL borrow records...");
        const records = await this.MuonSach.find({}).sort({ _id: -1 }).toArray();
        console.log(`[DEBUG SERVICE SUCCESS] Total records fetched from DB: ${records.length}`);
        return records;
    }

    async updateReturnDate(id, ngayTraThucTe, msnv = null) {
        console.log(`[DEBUG SERVICE - TheoDoiMuonSachService] Searching and updating return date for ID: ${id} by MSNV: ${msnv}`);
        
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { maPhieuMuon: id },
                { maMuonSach: id },
                { maDocGia: String(id) } 
            ]
        };

        const returnDate = ngayTraThucTe ? new Date(ngayTraThucTe) : new Date();
        const updateData = { 
            ngayTraThucTe: returnDate,
            trangThai: "DA_TRA"
        };

        if (msnv) {
            updateData.MSNV = String(msnv);
        }

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );

        console.log("[DEBUG SERVICE SUCCESS] Updated record result:", JSON.stringify(result, null, 2));
        return result;
    }

    async findByDocGia(maDocGia) {
        console.log("\n==================================================");
        console.log(`[DEBUG SERVICE - findByDocGia] Fetching borrow history for: '${maDocGia}'`);

        const matchConditions = [
            { maDocGia: String(maDocGia) },
            { MaDocGia: String(maDocGia) },
            { maDocGia: maDocGia },
            { MaDocGia: maDocGia }
        ];

        const pipeline = [
            {
                $match: {
                    $or: matchConditions
                }
            },
            {
                $lookup: {
                    from: "sach",
                    localField: "maSach",
                    foreignField: "maSach",
                    as: "thongTinSach"
                }
            },
            { $unwind: { path: "$thongTinSach", preserveNullAndEmptyArrays: true } },
            { $sort: { _id: -1 } }
        ];

        const history = await this.MuonSach.aggregate(pipeline).toArray();

        console.log(`[DEBUG SERVICE - findByDocGia SUCCESS] Found ${history.length} records!`);
        console.log("==================================================\n");

        return history;
    }

    async findById(id) {
        console.log(`[DEBUG SERVICE - findById] Finding record with ID: ${id}`);
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { maPhieuMuon: id },
                { maMuonSach: id }
            ]
        };
        const record = await this.MuonSach.findOne(filter);
        console.log("[DEBUG SERVICE - findById Result]:", JSON.stringify(record, null, 2));
        return record;
    }

    async updateTrangThai(id, trangThai, msnv = null) {
        console.log(`[DEBUG SERVICE - updateTrangThai] Updating status for ID: ${id} to '${trangThai}' by MSNV: ${msnv}`);
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { maPhieuMuon: id },
                { maMuonSach: id }
            ]
        };

        const updateData = { trangThai: trangThai };
        if (msnv) {
            updateData.MSNV = String(msnv);
        }

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );

        console.log("[DEBUG SERVICE SUCCESS - updateTrangThai]:", JSON.stringify(result, null, 2));
        return result;
    }

    async giaHan(id) {
        console.log(`[DEBUG SERVICE - giaHan] Gia hạn sách cho phiếu mượn ID: ${id}`);
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { maPhieuMuon: id },
                { maMuonSach: id }
            ]
        };

        const record = await this.MuonSach.findOne(filter);
        if (!record) {
            throw new Error("Không tìm thấy phiếu mượn!");
        }

        if (record.trangThai === "DA_TRA" || record.trangThai === "TU_CHOI") {
            throw new Error("Không thể gia hạn sách đã trả hoặc bị từ chối!");
        }

        if (record.soLanGiaHan >= 1) {
            throw new Error("Mỗi cuốn sách chỉ được gia hạn 1 lần!");
        }

        const newNgayTraDuKien = new Date(record.ngayTraDuKien);
        newNgayTraDuKien.setDate(newNgayTraDuKien.getDate() + 7);

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { 
                $set: { ngayTraDuKien: newNgayTraDuKien },
                $inc: { soLanGiaHan: 1 }
            },
            { returnDocument: "after" }
        );

        console.log("[DEBUG SERVICE SUCCESS - giaHan]:", JSON.stringify(result, null, 2));
        return result;
    }
}

module.exports = TheoDoiMuonSachService;