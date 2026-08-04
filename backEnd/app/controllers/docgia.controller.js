const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.register = async (req, res, next) => {
    if (!req.body?.tenTaiKhoan || !req.body?.matKhau || !req.body?.hoTen) {
        return next(new ApiError(400, "Họ tên, tên tài khoản và mật khẩu là bắt buộc!"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const existingAccount = await docGiaService.findByTenTaiKhoan(req.body.tenTaiKhoan);
        if (existingAccount) {
            return next(new ApiError(400, "Tên tài khoản đã tồn tại!"));
        }

        const count = (await docGiaService.find({})).length;
        req.body.maDocGia = req.body.maDocGia || `DG${String(count + 1).padStart(4, '0')}`;

        const document = await docGiaService.create(req.body);
        return res.status(201).send(document);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi đăng ký tài khoản độc giả"));
    }
};

exports.login = async (req, res, next) => {
    const { tenTaiKhoan, matKhau } = req.body;
    if (!tenTaiKhoan || !matKhau) {
        return next(new ApiError(400, "Tên đăng nhập và mật khẩu không được trống!"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const docGia = await docGiaService.findByTenTaiKhoan(tenTaiKhoan);

        if (!docGia || docGia.matKhau !== matKhau) {
            return next(new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác!"));
        }

        return res.send({
            message: "Đăng nhập thành công!",
            docGia: {
                maDocGia: docGia.maDocGia,
                hoTen: docGia.hoTen,
                tenTaiKhoan: docGia.tenTaiKhoan,
                email: docGia.email,
                dienThoai: docGia.dienThoai
            }
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi hệ thống khi xử lý đăng nhập"));
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const { name } = req.query;
        let documents = [];
        if (name) {
            documents = await docGiaService.find({
                hoTen: { $regex: new RegExp(name), $options: "i" }
            });
        } else {
            documents = await docGiaService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách độc giả"));
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const document = await docGiaService.findByMaDocGia(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy thông tin độc giả"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi lấy thông tin độc giả id=${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    const { id } = req.params;
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống!"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const updatedDocGia = await docGiaService.update(id, req.body);

        if (!updatedDocGia) {
            return next(new ApiError(404, "Không tìm thấy độc giả để cập nhật!"));
        }

        return res.send({
            message: "Cập nhật thông tin độc giả thành công!",
            data: updatedDocGia
        });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật độc giả: ${error.message}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const document = await docGiaService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy độc giả để xóa"));
        }
        return res.send({ message: "Ngừng hoạt động độc giả thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi ngừng hoạt động độc giả id=${req.params.id}`));
    }
};

exports.toggleLock = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const { id } = req.params;
        const { status } = req.body; 

        if (status === undefined || ![1, 3].includes(status)) {
            return next(new ApiError(400, "Trạng thái không hợp lệ! (1: Bình thường, 3: Khóa)"));
        }

        const document = await docGiaService.updateAccountStatus(id, status);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy độc giả để cập nhật"));
        }
        return res.send({ message: "Cập nhật trạng thái khóa thành công!", data: document });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi khóa/mở khóa độc giả id=${req.params.id}`));
    }
};