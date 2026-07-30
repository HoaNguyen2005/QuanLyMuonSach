const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
    constructor(client) {
        // Đồng bộ tên biến collection thống nhất
        this.MuonSach = client.db().collection("theodoimuonsach");
        console.log("\n==================================================");
        console.log("[DEBUG SERVICE - TheoDoiMuonSachService] Initialized 'theodoimuonsach' collection handler.");
        console.log("==================================================\n");
    }

    async create(payload) {
        console.log("[DEBUG SERVICE - TheoDoiMuonSachService] Bắt đầu tạo bản ghi mượn sách...");
        console.log("[DEBUG SERVICE - Payload nhận được]:", JSON.stringify(payload, null, 2));

        const ngayMuon = payload.ngayMuon ? new Date(payload.ngayMuon) : new Date();
        const ngayTraDuKien = payload.ngayTraDuKien ? new Date(payload.ngayTraDuKien) : null;

        if (ngayTraDuKien && ngayTraDuKien < ngayMuon) {
            console.error("[DEBUG SERVICE - ERROR] Ngày trả dự kiến nhỏ hơn ngày mượn!");
            throw new Error("Ngày trả dự kiến phải lớn hơn hoặc bằng ngày mượn!");
        }

        const record = {
            maDocGia: String(payload.maDocGia || payload.MaDocGia),
            maSach: String(payload.maSach || payload.MaSach),
            ngayMuon: ngayMuon,
            ngayTraDuKien: ngayTraDuKien,
            ngayTraThucTe: null,
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
        // ĐÃ SỬA: Dùng đúng this.MuonSach thay vì this.TheoDoiMuonSach
        const records = await this.MuonSach.find({}).sort({ _id: -1 }).toArray();
        console.log(`[DEBUG SERVICE SUCCESS] Total records fetched from DB: ${records.length}`);
        return records;
    }

    async updateReturnDate(id, ngayTraThucTe) {
        console.log(`[DEBUG SERVICE - TheoDoiMuonSachService] Searching and updating return date for ID: ${id}`);
        
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { maPhieuMuon: id },
                { maMuonSach: id },
                { maDocGia: String(id) } 
            ]
        };

        const returnDate = ngayTraThucTe ? new Date(ngayTraThucTe) : new Date();
        console.log(`[DEBUG SERVICE] Updating ngayTraThucTe to: ${returnDate.toISOString()}`);

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { 
                $set: { 
                    ngayTraThucTe: returnDate,
                    trangThai: "DA_TRA"
                } 
            },
            { returnDocument: "after" }
        );

        console.log("[DEBUG SERVICE SUCCESS] Updated record result:", JSON.stringify(result, null, 2));
        return result;
    }

    async findByDocGia(maDocGia) {
        console.log("\n==================================================");
        console.log(`[DEBUG SERVICE - findByDocGia] Fetching borrow history for: '${maDocGia}'`);

        // Tạo danh sách các điều kiện tìm kiếm linh hoạt nhất có thể
        const matchConditions = [
            { maDocGia: String(maDocGia) },
            { MaDocGia: String(maDocGia) },
            { maDocGia: maDocGia },
            { MaDocGia: maDocGia }
        ];

        console.log("[DEBUG SERVICE - findByDocGia] Match conditions:", JSON.stringify(matchConditions, null, 2));

        const pipeline = [
            {
                $match: {
                    $or: matchConditions
                }
            },
            // Lookup thông tin sách từ collection 'sach'
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
        if (history.length > 0) {
            console.log("[DEBUG SERVICE - Sample Record]:", JSON.stringify(history[0], null, 2));
        }
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

    async updateTrangThai(id, trangThai) {
        console.log(`[DEBUG SERVICE - updateTrangThai] Updating status for ID: ${id} to '${trangThai}'`);
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { maPhieuMuon: id },
                { maMuonSach: id }
            ]
        };

        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { $set: { trangThai: trangThai } },
            { returnDocument: "after" }
        );

        console.log("[DEBUG SERVICE SUCCESS - updateTrangThai]:", JSON.stringify(result, null, 2));
        return result;
    }
}

module.exports = TheoDoiMuonSachService;