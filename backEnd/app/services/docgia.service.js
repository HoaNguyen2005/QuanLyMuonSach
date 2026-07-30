const { ObjectId } = require("mongodb");

class DocGiaService {
    constructor(client) {
        this.DocGia = client.db().collection("docgia");
    }

    extractDocGiaData(payload) {
        const docGia = {
            maDocGia: payload.maDocGia,
            hoTen: payload.hoTen || payload.ten,
            tenTaiKhoan: payload.tenTaiKhoan || payload.maDocGia,
            matKhau: payload.matKhau || payload.password,
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
            phai: payload.phai
        };

        const result = await this.DocGia.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(maDocGia) {
        console.log(`[DEBUG BACKEND - DocGiaService] Deleting docGia with maDocGia: '${maDocGia}'`);
        const result = await this.DocGia.findOneAndDelete({ maDocGia: maDocGia });
        console.log("[DEBUG BACKEND - DocGiaService] Delete result:", JSON.stringify(result, null, 2));
        return result;
    }
}

module.exports = DocGiaService;