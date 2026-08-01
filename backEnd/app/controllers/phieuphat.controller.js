const PhieuPhatService = require("../services/phieuphat.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// 1. Độc giả gửi yêu cầu nộp phạt
exports.create = async (req, res, next) => {
  if (!req.body?.maPhieuMuon || !req.body?.maDocGia) {
    return next(new ApiError(400, "Thông tin phiếu mượn và mã độc giả không được để trống!"));
  }

  try {
    console.log("================ [DEBUG BACKEND - CREATE PHIEU PHAT] ================");
    console.log("[DEBUG BACKEND] Payload:", req.body);

    const phieuPhatService = new PhieuPhatService(MongoDB.client);
    const result = await phieuPhatService.create(req.body);

    if (!result) {
      return next(new ApiError(400, "Yêu cầu nộp phạt cho đơn này đang chờ Admin duyệt!"));
    }

    console.log("[DEBUG BACKEND] PhieuPhat created successfully!");
    return res.send({ message: "Tạo yêu cầu nộp phạt thành công!", data: result });
  } catch (error) {
    console.error("[DEBUG BACKEND ERROR] Create Error:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi tạo phiếu phạt!"));
  }
};

// 2. Lấy danh sách tất cả phiếu phạt
exports.findAll = async (req, res, next) => {
  try {
    const phieuPhatService = new PhieuPhatService(MongoDB.client);
    const documents = await phieuPhatService.find({});
    console.log(`[DEBUG BACKEND] Fetched ${documents.length} PhieuPhat records`);
    return res.send(documents);
  } catch (error) {
    console.error("[DEBUG BACKEND ERROR] FindAll Error:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách phiếu phạt!"));
  }
};

// 3. Admin duyệt xác nhận thanh toán
exports.approve = async (req, res, next) => {
  try {
    const phieuPhatService = new PhieuPhatService(MongoDB.client);
    const staffId = req.body?.MSNV || null;
    const document = await phieuPhatService.approve(req.params.id, staffId);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu phạt!"));
    }

    console.log(`[DEBUG BACKEND] Approved successfully ID: ${req.params.id} by MSNV: ${staffId}`);
    return res.send({ message: "Đã xác nhận thanh toán tiền phạt thành công!", data: document });
  } catch (error) {
    console.error("[DEBUG BACKEND ERROR] Approve Error:", error);
    return next(new ApiError(500, `Lỗi cập nhật phiếu phạt với id=${req.params.id}`));
  }
};