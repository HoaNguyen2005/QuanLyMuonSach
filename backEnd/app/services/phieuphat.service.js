const { ObjectId } = require("mongodb");

class PhieuPhatService {
  constructor(client) {
    // Đã chuẩn hóa về phieu_phat
    this.PhieuPhat = client.db().collection("phieuphat");
  }

  // Định nghĩa dữ liệu phiếu phạt
  extractPhieuPhatData(payload) {
    const phieuPhat = {
      maPhieuMuon: payload.maPhieuMuon,
      maDocGia: payload.maDocGia,
      MSNV: payload.MSNV || null,
      soNgayTre: Number(payload.soNgayTre),
      soTienPhat: Number(payload.soTienPhat),
      noiDungChuyenKhoan: payload.noiDungChuyenKhoan,
      trangThai: payload.trangThai || "CHO_XAC_NHAN",
      ngayTao: payload.ngayTao ? new Date(payload.ngayTao) : new Date(),
      ngayDuyet: payload.ngayDuyet ? new Date(payload.ngayDuyet) : null,
    };

    // Xóa các trường undefined
    Object.keys(phieuPhat).forEach(
      (key) => phieuPhat[key] === undefined && delete phieuPhat[key]
    );
    return phieuPhat;
  }

  // 1. Tạo phiếu phạt mới
  async create(payload) {
    const phieuPhat = this.extractPhieuPhatData(payload);
    
    // Kiểm tra xem đã có yêu cầu chờ duyệt cho phiếu mượn này chưa
    const existing = await this.PhieuPhat.findOne({
      maPhieuMuon: phieuPhat.maPhieuMuon,
      trangThai: "CHO_XAC_NHAN",
    });

    if (existing) {
      return null; // Đã tồn tại yêu cầu chờ duyệt
    }

    const result = await this.PhieuPhat.insertOne(phieuPhat);
    return result;
  }

  // 2. Lấy tất cả phiếu phạt
  async find(filter = {}) {
    const cursor = await this.PhieuPhat.find(filter).sort({ ngayTao: -1 });
    return await cursor.toArray();
  }

  // 3. Tìm theo ID
  async findById(id) {
    return await this.PhieuPhat.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // 4. Admin duyệt xác nhận đã nhận tiền
  async approve(id, msnv = null) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const updateData = {
      trangThai: "DA_THANH_TOAN",
      ngayDuyet: new Date(),
    };

    if (msnv) {
      updateData.MSNV = String(msnv);
    }

    const update = { $set: updateData };

    const result = await this.PhieuPhat.findOneAndUpdate(filter, update, {
      returnDocument: "after",
    });
    return result;
  }
}

module.exports = PhieuPhatService;