const { ObjectId } = require("mongodb");

class SachService {
    constructor(client) {
        this.Sach = client.db().collection("sach");
        console.log("[DEBUG SERVICE - SachService] Initialized Sach collection handler.");
    }

    extractSachData(payload) {
        const sach = {
            maSach: payload.maSach,
            tenSach: payload.tenSach,
            donGia: payload.donGia,
            soQuyen: payload.soQuyen,
            namXuatBan: payload.namXuatBan,
            maNXB: payload.maNXB,
            tacGia: payload.tacGia,
            hinhAnh: payload.hinhAnh,
        };
        // Lọc bỏ các thuộc tính undefined
        Object.keys(sach).forEach(
            (key) => sach[key] === undefined && delete sach[key]
        );
        return sach;
    }

    async create(payload) {
        console.log("[DEBUG SERVICE - SachService] Creating new book record...");
        const sach = this.extractSachData(payload);
        
        const existingBook = await this.findByMaSach(sach.maSach);
        if (existingBook) {
            console.warn(`[DEBUG SERVICE - SachService] Book with maSach ${sach.maSach} already exists!`);
            return null;
        }

        const result = await this.Sach.insertOne(sach);
        console.log(`[DEBUG SERVICE - SachService] Inserted book ID: ${result.insertedId}`);
        return { _id: result.insertedId, ...sach };
    }

    async find(filter) {
        const query = { ...filter, deleted: { $ne: true } };
        console.log("[DEBUG SERVICE - SachService] Querying Sach with filter:", JSON.stringify(query));
        const cursor = await this.Sach.find(query);
        const documents = await cursor.toArray();
        console.log(`[DEBUG SERVICE - SachService] Found ${documents.length} items.`);
        return documents;
    }

    async findByMaSach(maSach) {
        return await this.Sach.findOne({ maSach: maSach, deleted: { $ne: true } });
    }

    async findByName(name) {
        return await this.find({
            tenSach: { $regex: new RegExp(name), $options: "i" } // 'i' giúp tìm kiếm không phân biệt HOA/thường
        });
    }

    async updateQuantity(maSach, amount) {
        
        const result = await this.Sach.findOneAndUpdate(
            { maSach: maSach },
            { $inc: { soQuyen: amount } },
            { returnDocument: "after" }
        );
        return result;
    }
    
    async delete(maSach) {
        const result = await this.Sach.findOneAndUpdate(
            { maSach: maSach }, 
            { $set: { deleted: true } },
            { returnDocument: "after" }
        );
        return result;
    }

    async deleteAll() {
        const result = await this.Sach.updateMany({}, { $set: { deleted: true } });
        return result.modifiedCount;
    }
    async update(maSach, payload) {
        console.log("[DEBUG] Service update maSach:", maSach);
        console.log("[DEBUG] Service update payload:", payload);

        const filter = { maSach: maSach };
        const update = { $set: payload };
        
        const result = await this.Sach.findOneAndUpdate(
            filter, 
            update, 
            { returnDocument: "after" }
        );

        console.log("[DEBUG] Service update MongoDB result:", result);
        return result;
    }
}

module.exports = SachService;