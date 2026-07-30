const NhanVienService = require("../services/nhanvien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.login = async (req, res, next) => {
    const { MSNV, Password } = req.body;
    if (!MSNV || !Password) {
        return next(new ApiError(400, "Mã số nhân viên và mật khẩu là bắt buộc!"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const nhanVien = await nhanVienService.findByMSNV(MSNV);

        if (!nhanVien || nhanVien.Password !== Password) {
            return next(new ApiError(401, "Mã nhân viên hoặc mật khẩu không đúng!"));
        }

        return res.send({
            message: "Đăng nhập Admin thành công!",
            nhanVien: {
                MSNV: nhanVien.MSNV,
                HoTenNV: nhanVien.HoTenNV,
                ChucVu: nhanVien.ChucVu
            }
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xử lý đăng nhập nhân viên"));
    }
};

exports.create = async (req, res, next) => {
    if (!req.body?.MSNV || !req.body?.HoTenNV || !req.body?.Password) {
        return next(new ApiError(400, "MSNV, Họ tên và Mật khẩu không được để trống!"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.create(req.body);
        return res.status(201).send(document);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tạo thông tin nhân viên"));
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const { name } = req.query;
        let documents = [];
        if (name) {
            documents = await nhanVienService.find({
                HoTenNV: { $regex: new RegExp(name), $options: "i" }
            });
        } else {
            documents = await nhanVienService.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách nhân viên"));
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.findByMSNV(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy thông tin nhân viên"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi truy vấn nhân viên MSNV=${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống!"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhân viên để cập nhật"));
        }
        return res.send({ message: "Cập nhật thông tin nhân viên thành công!", data: document });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật nhân viên MSNV=${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy nhân viên để xóa"));
        }
        return res.send({ message: "Xóa nhân viên thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa nhân viên MSNV=${req.params.id}`));
    }
};