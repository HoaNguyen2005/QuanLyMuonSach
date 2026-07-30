class NhanVienService {
    constructor(client) {
        this.NhanVien = client.db().collection("nhanvien");
    }

    extractNhanVienData(payload) {
        const nhanVien = {
            MSNV: payload.MSNV,
            HoTenNV: payload.HoTenNV,
            Password: payload.Password,
            ChucVu: payload.ChucVu || "Thủ thư",
            DiaChi: payload.DiaChi,
            SoDienThoai: payload.SoDienThoai
        };
        Object.keys(nhanVien).forEach(
            (key) => nhanVien[key] === undefined && delete nhanVien[key]
        );
        return nhanVien;
    }

    async create(payload) {
        const nhanVien = this.extractNhanVienData(payload);
        const result = await this.NhanVien.findOneAndUpdate(
            { MSNV: nhanVien.MSNV },
            { $set: nhanVien },
            { returnDocument: "after", upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.NhanVien.find(filter);
        return await cursor.toArray();
    }

    async findByMSNV(msnv) {
        return await this.NhanVien.findOne({ MSNV: msnv });
    }

    async update(id, payload) {
        
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { MSNV: id }
            ]
        };

        const updateData = {
            hoTenNV: payload.hoTenNV || payload.hoTen,
            email: payload.email,
            ngaySinh: payload.ngaySinh,
            phai: payload.phai,
            chucVu: payload.chucVu,
            soDienThoai: payload.soDienThoai || payload.dienThoai,
            diaChi: payload.diaChi
        };

        if (payload.password) {
            updateData.password = payload.password;
        }

        const result = await this.NhanVien.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );

        return result;
    }

    async delete(msnv) {
        const result = await this.NhanVien.findOneAndDelete({ MSNV: msnv });
        return result;
    }
}

module.exports = NhanVienService;