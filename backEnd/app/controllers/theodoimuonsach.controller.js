const TheoDoiMuonSachService = require("../services/theodoimuonsach.service");
const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    const { maDocGia, maSach, ngayMuon, ngayTraDuKien, MSNV } = req.body;

    if (!maDocGia || !maSach) {
        return next(new ApiError(400, "Mã độc giả và Mã sách là bắt buộc!"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const borrowService = new TheoDoiMuonSachService(MongoDB.client);
        const DocGiaService = require("../services/docgia.service");
        const docGiaService = new DocGiaService(MongoDB.client);

        const docGia = await docGiaService.findByMaDocGia(maDocGia);
        if (docGia && docGia.trangThaiTaiKhoan === 3) {
            return next(new ApiError(403, "Tài khoản của bạn đã bị khóa. Không thể thực hiện mượn sách."));
        }
        if (docGia && docGia.trangThaiTaiKhoan === 2) {
            return next(new ApiError(403, "Tài khoản của bạn đã ngừng hoạt động."));
        }

        const activeBorrowsCount = await borrowService.countActiveBorrows(maDocGia);
        if (activeBorrowsCount >= 10) {
            return next(new ApiError(400, "Bạn đã đạt giới hạn mượn tối đa 10 cuốn sách. Vui lòng trả sách trước khi mượn thêm!"));
        }

        // --- CHECK TRỄ HẠN / NỢ PHẠT ---
        const allBorrows = await borrowService.findByDocGia(maDocGia);
        let hasOverdueOrUnpaid = false;
        const PhieuPhat = MongoDB.client.db().collection("phieuphat");

        for (const record of allBorrows) {
            if (!record.ngayTraDuKien) continue;
            
            const ngayDuKien = new Date(record.ngayTraDuKien || record.NgayTraDuKien || record.ngayTra);
            ngayDuKien.setHours(0, 0, 0, 0);

            // 1. Đang mượn nhưng quá hạn
            const activeStatuses = ["DA_DUYET", "DANG_MUON", "ĐÃ_DUYỆT", "ĐÃ DUYỆT", "ĐANG_MƯỢN", "YEU_CAU_TRA"];
            const currentStatus = record.trangThai || record.TrangThai;
            
            if (activeStatuses.includes(currentStatus) && !(record.ngayTraThucTe || record.NgayTraThucTe)) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (today > ngayDuKien) {
                    hasOverdueOrUnpaid = true;
                    break;
                }
            }

            // 2. Đã trả nhưng trễ hạn, chưa nộp phạt (hoặc đang chờ xác nhận)
            const ngayThucTe = record.ngayTraThucTe || record.NgayTraThucTe;
            if (ngayThucTe) {
                const dateThucTe = new Date(ngayThucTe);
                dateThucTe.setHours(0, 0, 0, 0);
                if (dateThucTe > ngayDuKien) {
                    const targetId = String(record._id || record.maPhieuMuon);
                    const phieuPhat = await PhieuPhat.findOne({ maPhieuMuon: targetId });
                    
                    if (!phieuPhat || phieuPhat.trangThai !== "DA_THANH_TOAN") {
                        hasOverdueOrUnpaid = true;
                        break;
                    }
                }
            }
        }

        if (hasOverdueOrUnpaid) {
            return next(new ApiError(400, "Bạn đang có sách trễ hạn hoặc chưa nộp phạt. Vui lòng hoàn tất trả sách và nộp phạt trước khi mượn thêm!"));
        }
        // --- END CHECK ---

        const sach = await sachService.findByMaSach(maSach);
        if (!sach) {
            return next(new ApiError(404, "Sách không tồn tại trong hệ thống!"));
        }

        const currentQuantity = sach.soQuyen !== undefined ? sach.soQuyen : sach.SoQuyen;
        if (currentQuantity === undefined || currentQuantity <= 0) {
            return next(new ApiError(400, "Sách hiện tại đã hết, không thể mượn!"));
        }

        const payload = {
            maDocGia,
            maSach,
            MSNV: MSNV|| null, 
            ngayMuon: ngayMuon || new Date().toISOString().split('T')[0],
            ngayTraDuKien: ngayTraDuKien || null,
            trangThai: "CHO_DUYET"
        };
        const borrowRecord = await borrowService.create(payload);

        await sachService.updateQuantity(maSach, -1);
        return res.status(201).send({
            message: "Mượn sách thành công!",
            data: borrowRecord
        });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi xử lý mượn sách!"));
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const borrowService = new TheoDoiMuonSachService(MongoDB.client);
        const documents = await borrowService.findAll();
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách mượn sách"));
    }
};

exports.traSach = async (req, res, next) => {
    const { id } = req.params;
    const { ngayTraThucTe, MSNV} = req.body;
    try {
        const borrowService = new TheoDoiMuonSachService(MongoDB.client);
        const sachService = new SachService(MongoDB.client);

        const staffId = MSNV || null;
        const updatedRecord = await borrowService.updateReturnDate(id, ngayTraThucTe, staffId);
        if (!updatedRecord) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn sách!"));
        }

        if (updatedRecord.maSach) {
            await sachService.updateQuantity(updatedRecord.maSach, 1);
        }
        return res.send({
            message: "Trả sách thành công!",
            data: updatedRecord
        });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi xử lý trả sách!"));
    }
};

exports.getLichSuByDocGia = async (req, res, next) => {
    const { maDocGia } = req.params;
    try {
        const borrowService = new TheoDoiMuonSachService(MongoDB.client);
        const documents = await borrowService.findByDocGia(maDocGia);
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi lấy lịch sử mượn sách của độc giả ${maDocGia}`)
        );
    }
};

exports.updateTrangThai = async (req, res, next) => {
    const { id } = req.params;
    const { trangThai, MSNV } = req.body;

    if (!trangThai) {
        return next(new ApiError(400, "Trạng thái không được để trống!"));
    }

    try {
        const borrowService = new TheoDoiMuonSachService(MongoDB.client);
        const sachService = new SachService(MongoDB.client);

        // 1. Kiểm tra tồn tại bản ghi phiếu mượn
        const record = await borrowService.findById(id);
        if (!record) {
            return next(new ApiError(404, "Không tìm thấy phiếu mượn!"));
        }

        // Kiểm tra giới hạn mượn 10 cuốn khi duyệt
        const activeStatuses = ["DA_DUYET", "DANG_MUON", "ĐÃ_DUYỆT", "ĐÃ DUYỆT", "ĐANG_MƯỢN"];
        if (activeStatuses.includes(trangThai) && !activeStatuses.includes(record.trangThai)) {
            const approvedCount = await borrowService.countApprovedBorrows(record.maDocGia);
            if (approvedCount >= 10) {
                return next(new ApiError(400, "Độc giả này đã đạt giới hạn mượn tối đa 10 cuốn sách. Không thể duyệt mượn thêm!"));
            }
        }

        // 2. Gọi hàm updateTrangThai truyền kèm MSNV của người duyệt
        const staffId = MSNV || null;
        const updatedRecord = await borrowService.updateTrangThai(id, trangThai, staffId);

        // 3. Nếu chuyển sang Từ chối (TU_CHOI), hoàn trả +1 số lượng sách vào kho
        if (trangThai === "TU_CHOI" && record.trangThai !== "TU_CHOI") {
            if (record.maSach) {
                await sachService.updateQuantity(record.maSach, 1);
            }
        }

        return res.send({
            message: "Cập nhật trạng thái thành công!",
            data: updatedRecord
        });

    } catch (error) {
        console.error("[DEBUG CONTROLLER ERROR - updateTrangThai]:", error);
        return next(new ApiError(500, `Lỗi server khi cập nhật trạng thái: ${error.message}`));
    }
};

exports.giaHanSach = async (req, res, next) => {
    const { id } = req.params;
    try {
        const borrowService = new TheoDoiMuonSachService(MongoDB.client);
        
        const updatedRecord = await borrowService.giaHan(id);
        
        return res.send({
            message: "Gia hạn sách thành công!",
            data: updatedRecord
        });
    } catch (error) {
        console.error("[DEBUG CONTROLLER ERROR - giaHanSach]:", error);
        return next(new ApiError(400, error.message || "Đã xảy ra lỗi khi xử lý gia hạn sách!"));
    }
};