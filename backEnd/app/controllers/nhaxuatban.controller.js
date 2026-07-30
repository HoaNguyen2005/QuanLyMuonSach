const NhaXuatBanService = require("../services/nhaxuatban.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
    console.log("==========================================");
    console.log("[DEBUG BACKEND - NhaXuatBanController] CREATE NXB REQUEST BODY:", JSON.stringify(req.body, null, 2));

    if (!req.body?.tenNXB && !req.body?.TenNXB) {
        return res.status(400).json({ message: "Tên nhà xuất bản không được để trống!" });
    }

    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.create(req.body);
        console.log("[DEBUG BACKEND - NhaXuatBanController] CREATE SUCCESSFUL:", JSON.stringify(document, null, 2));
        console.log("==========================================");
        return res.send(document);
    } catch (error) {
        console.error("[DEBUG BACKEND - NhaXuatBanController] CREATE ERROR:", error);
        console.log("==========================================");
        return next(error);
    }
};

exports.findAll = async (req, res, next) => {
    console.log("==========================================");
    console.log("[DEBUG BACKEND - NhaXuatBanController] GET ALL NXB REQUEST RECEIVED");
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const documents = await nhaXuatBanService.find({});
        
        console.log(`[DEBUG BACKEND - NhaXuatBanController] FOUND ${documents.length} NXB documents in DB`);
        console.log("[DEBUG BACKEND - NhaXuatBanController] DATA:", JSON.stringify(documents, null, 2));
        console.log("==========================================");

        return res.send(documents);
    } catch (error) {
        console.error("[DEBUG BACKEND - NhaXuatBanController] GET ALL ERROR:", error);
        console.log("==========================================");
        return next(error);
    }
};

exports.findOne = async (req, res, next) => {
    console.log(`[DEBUG BACKEND - NhaXuatBanController] GET ONE NXB ID: ${req.params.id}`);
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Không tìm thấy Nhà Xuất Bản!" });
        }
        return res.send(document);
    } catch (error) {
        return next(error);
    }
};

exports.update = async (req, res, next) => {
    console.log("==========================================");
    console.log(`[DEBUG BACKEND - NhaXuatBanController] UPDATE NXB ID: ${req.params.id}`);
    console.log("[DEBUG BACKEND - NhaXuatBanController] UPDATE BODY:", JSON.stringify(req.body, null, 2));

    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.update(req.params.id, req.body);
        if (!document) {
            return res.status(404).json({ message: "Không tìm thấy Nhà Xuất Bản để cập nhật!" });
        }
        console.log("[DEBUG BACKEND - NhaXuatBanController] UPDATE SUCCESSFUL");
        console.log("==========================================");
        return res.send({ message: "Cập nhật Nhà Xuất Bản thành công!", document });
    } catch (error) {
        console.error("[DEBUG BACKEND - NhaXuatBanController] UPDATE ERROR:", error);
        console.log("==========================================");
        return next(error);
    }
};

exports.delete = async (req, res, next) => {
    console.log(`[DEBUG BACKEND - NhaXuatBanController] DELETE NXB ID: ${req.params.id}`);
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
        const document = await nhaXuatBanService.delete(req.params.id);
        if (!document) {
            return res.status(404).json({ message: "Không tìm thấy Nhà Xuất Bản để xóa!" });
        }
        return res.send({ message: "Xóa Nhà Xuất Bản thành công!" });
    } catch (error) {
        return next(error);
    }
};