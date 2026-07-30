const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");

exports.create = async (req, res, next) => {
    if (!req.body?.maSach || !req.body?.tenSach) {
        return next(
            new ApiError(400, "Mã sách và Tên sách không được để trống!")
        );
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.create(req.body);

        if (!document) {
            return next(new ApiError(400, "Mã sách này đã tồn tại trong hệ thống!"));
        }

        return res.status(201).send(document);
    } catch (error) {
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo sách mới")
        );
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const { name } = req.query;
        
        let documents = [];
        if (name) {
            documents = await sachService.findByName(name);
        } else {
            documents = await sachService.find({});
        }
        
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách sách"));
    }
};
exports.findOne = async (req, res, next) => {
    try {
        const sachCollection = MongoDB.client.db().collection("sach");
        const id = req.params.id;
        if (!id || id === "undefined") {
            return next(new ApiError(400, "Mã ID sách không hợp lệ!"));
        }
        const conditions = [
            { maSach: id },
            { MaSach: id },
            { _id: id } 
        ];
        if (ObjectId.isValid(id) && id.length === 24) {
            conditions.push({ _id: new ObjectId(id) });
        } else {
            console.warn(`[DEBUG BACKEND - SachController] Param '${id}' không phải ObjectId 24 ký tự. Đang tìm theo dạng String / Mã sách.`);
        }
        const query = { $or: conditions };
        const document = await sachCollection.findOne(query);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy thông tin sách!"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Lỗi hệ thống khi lấy thông tin sách với id=${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách để xóa"));
        }
        return res.send({ message: "Xóa sách thành công!" });
    } catch (error) {
        return next(
            new ApiError(500, `Lỗi khi xóa sách với maSach=${req.params.id}`)
        );
    }
};
exports.deleteAll = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const deletedCount = await sachService.deleteAll();
        return res.send({
            message: `${deletedCount} cuốn sách đã được xóa thành công!`,
        });
    } catch (error) {
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả sách"));
    }
};

exports.update = async (req, res, next) => {
    console.log("[DEBUG] Controller update req.params.id:", req.params.id);
    console.log("[DEBUG] Controller update req.body:", req.body);

    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.update(req.params.id, req.body);
        
        console.log("[DEBUG] Result from sachService.update:", document);

        if (!document) {
            return next(new ApiError(404, "Không tìm thấy sách để cập nhật"));
        }
        return res.send({ message: "Cập nhật thông tin sách thành công!" });
    } catch (error) {
        console.error("[DEBUG ERROR] Error in update controller:", error);
        return next(
            new ApiError(500, `Lỗi khi cập nhật sách với maSach=${req.params.id}`)
        );
    }
};