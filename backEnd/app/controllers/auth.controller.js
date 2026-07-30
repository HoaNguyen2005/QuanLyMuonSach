const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.loginDocGia = async (req, res, next) => {
  
    const usernameInput = req.body.tenTaikhoan || req.body.username;
    const passwordInput = req.body.matKhau || req.body.password;

    console.log("\n==================================================");
    console.log("[DEBUG AUTH - LOGIN DOCGIA] Bắt đầu quá trình đăng nhập Độc Giả.");
    console.log(`[DEBUG AUTH - LOGIN DOCGIA] Dữ liệu tra cứu: username = "${usernameInput}"`);

    if (!usernameInput || !passwordInput) {
        console.warn("[DEBUG AUTH - LOGIN DOCGIA WARNING] Thiếu tài khoản hoặc mật khẩu!");
        console.log("==================================================\n");
        return next(new ApiError(400, "Vui lòng nhập tên tài khoản và mật khẩu!"));
    }

    try {
        const docGiaCollection = MongoDB.client.db().collection("docgia");

        const queryFilter = {
            $and: [
                {
                    $or: [
                        { tenTaiKhoan: usernameInput }, 
                        { maDocGia: usernameInput },    
                        { dienThoai: usernameInput }    
                    ]
                },
                {
                    $or: [
                        { matKhau: passwordInput },     
                        { matkhau: passwordInput }
                    ]
                }
            ]
        };

        console.log("[DEBUG AUTH - LOGIN DOCGIA] Filter query MongoDB:", JSON.stringify(queryFilter, null, 2));

        const docGia = await docGiaCollection.findOne(queryFilter);

        if (!docGia) {
            console.warn(`[DEBUG AUTH - LOGIN DOCGIA WARNING] Không tìm thấy độc giả khớp với '${usernameInput}'!`);
            console.log("==================================================\n");
            return next(new ApiError(401, "Tên tài khoản hoặc mật khẩu không chính xác!"));
        }

        console.log("[DEBUG AUTH - LOGIN DOCGIA SUCCESS] Đã tìm thấy Độc Giả trong DB:");
        console.log(JSON.stringify(docGia, null, 2));

        const userPayload = {
            id: docGia._id,
            maDocGia: docGia.maDocGia,         
            maNhanVien: null,
            tenTaiKhoan: docGia.tenTaiKhoan,   
            hoTen: docGia.hoTen,               
            role: "docgia"                      
        };

        console.log("[DEBUG AUTH - LOGIN DOCGIA SUCCESS] Payload trả về Client:");
        console.log(JSON.stringify(userPayload, null, 2));
        console.log("==================================================\n");

        return res.status(200).send({
            message: "Đăng nhập Độc giả thành công!",
            user: userPayload
        });

    } catch (error) {
        console.error("[DEBUG AUTH - LOGIN DOCGIA ERROR] Ngoại lệ:", error);
        console.log("==================================================\n");
        return next(new ApiError(500, `Lỗi server khi đăng nhập: ${error.message}`));
    }
};

exports.loginNhanVien = async (req, res, next) => {
    const usernameInput = req.body.tenTaikhoan || req.body.username;
    const passwordInput = req.body.matKhau || req.body.password;

    console.log("\n==================================================");
    console.log("[DEBUG AUTH - LOGIN NHANVIEN] Bắt đầu quá trình đăng nhập Nhân viên.");
    console.log(`[DEBUG AUTH - LOGIN NHANVIEN] Tra cứu: "${usernameInput}"`);

    if (!usernameInput || !passwordInput) {
        console.warn("[DEBUG AUTH - LOGIN NHANVIEN WARNING] Thiếu tài khoản hoặc mật khẩu!");
        console.log("==================================================\n");
        return next(new ApiError(400, "Vui lòng nhập tên tài khoản và mật khẩu!"));
    }

    try {
        console.log("[DEBUG AUTH - LOGIN NHANVIEN] Kết nối Collection: 'nhanvien'...");
        const nhanVienCollection = MongoDB.client.db().collection("nhanvien");

        const queryFilter = {
            $and: [
                {
                    $or: [
                        { MSNV: usernameInput },         
                        { SoDienThoai: usernameInput },  
                        { tenTaiKhoan: usernameInput }
                    ]
                },
                {
                    $or: [
                        { Password: passwordInput },     
                        { matKhau: passwordInput },
                        { password: passwordInput }
                    ]
                }
            ]
        };

        console.log("[DEBUG AUTH - LOGIN NHANVIEN] Filter query MongoDB:", JSON.stringify(queryFilter, null, 2));

        const nhanVien = await nhanVienCollection.findOne(queryFilter);

        if (!nhanVien) {
            console.warn(`[DEBUG AUTH - LOGIN NHANVIEN WARNING] Không tìm thấy Nhân viên khớp với '${usernameInput}'!`);
            console.log("==================================================\n");
            return next(new ApiError(401, "Tài khoản hoặc mật khẩu Nhân viên không chính xác!"));
        }

        console.log("[DEBUG AUTH - LOGIN NHANVIEN SUCCESS] Đã tìm thấy Nhân viên trong DB:");
        console.log(JSON.stringify(nhanVien, null, 2));

        const userPayload = {
            id: nhanVien._id,
            maDocGia: null,
            maNhanVien: nhanVien.MSNV,                     
            tenTaiKhoan: nhanVien.MSNV,                   
            hoTen: nhanVien.HoTenNV || "Quản trị viên",    
            chucVu: nhanVien.ChucVu || "NhanVien",         
            role: "admin"                                  
        };

        console.log("[DEBUG AUTH - LOGIN NHANVIEN SUCCESS] Payload trả về Client:");
        console.log(JSON.stringify(userPayload, null, 2));
        console.log("==================================================\n");

        return res.status(200).send({
            message: "Đăng nhập Nhân viên thành công!",
            user: userPayload
        });

    } catch (error) {
        console.error("[DEBUG AUTH - LOGIN NHANVIEN ERROR] Ngoại lệ:", error);
        console.log("==================================================\n");
        return next(new ApiError(500, `Lỗi server khi đăng nhập Nhân viên: ${error.message}`));
    }
};

exports.login = async (req, res, next) => {
    const usernameInput = req.body.tenTaikhoan || req.body.username || "";
    const roleInput = req.body.role;

    console.log("\n==================================================");
    console.log("[DEBUG AUTH - UNIFIED LOGIN] Bắt đầu xử lý Đăng nhập tổng hợp.");
    console.log("[DEBUG AUTH - UNIFIED LOGIN] Tham số nhận được:", JSON.stringify(req.body, null, 2));

    const isStaffAccount = 
        roleInput === "admin" || 
        roleInput === "nhanvien" || 
        usernameInput.toUpperCase().startsWith("NV") || 
        usernameInput.toLowerCase().includes("admin");

    if (isStaffAccount) {
        console.log(`[DEBUG AUTH - UNIFIED LOGIN] Phát hiện tài khoản Nhân viên/Admin ("${usernameInput}") -> Chuyển hướng loginNhanVien.`);
        return exports.loginNhanVien(req, res, next);
    } else {
        console.log(`[DEBUG AUTH - UNIFIED LOGIN] Phát hiện tài khoản Độc giả ("${usernameInput}") -> Chuyển hướng loginDocGia.`);
        return exports.loginDocGia(req, res, next);
    }
};

exports.registerDocGia = async (req, res, next) => {
    const tenTaiKhoan = req.body.tenTaiKhoan || req.body.tenTaikhoan || req.body.username;
    const matKhau = req.body.matKhau || req.body.password;
    const hoTen = req.body.hoTen || req.body.ten;
    const email = req.body.email || "";
    const ngaySinh = req.body.ngaySinh || "";
    const gioiTinh = req.body.gioiTinh || "Nam";
    const dienThoai = req.body.dienThoai || req.body.soDienThoai || "";
    const diaChi = req.body.diaChi || req.body.diachi || "";

    console.log("\n==================================================");
    console.log("[DEBUG AUTH - REGISTER] Bắt đầu xử lý Đăng ký Độc Giả.");
    console.log("[DEBUG AUTH - REGISTER] Dữ liệu từ Client:", JSON.stringify(req.body, null, 2));

    if (!tenTaiKhoan || !matKhau || !hoTen) {
        console.warn("[DEBUG AUTH - REGISTER WARNING] Thiếu thông tin bắt buộc!");
        console.log("==================================================\n");
        return next(new ApiError(400, "Vui lòng điền đầy đủ Tên tài khoản, Mật khẩu và Họ tên!"));
    }

    try {
        const docGiaCollection = MongoDB.client.db().collection("docgia");

        const existingUser = await docGiaCollection.findOne({
            $or: [
                { tenTaiKhoan: tenTaiKhoan },
                { tenTaikhoan: tenTaiKhoan },
                { username: tenTaiKhoan }
            ]
        });

        if (existingUser) {
            console.warn(`[DEBUG AUTH - REGISTER WARNING] Tài khoản '${tenTaiKhoan}' đã tồn tại!`);
            console.log("==================================================\n");
            return next(new ApiError(400, "Tên tài khoản này đã được sử dụng!"));
        }

        const lastDocGia = await docGiaCollection
            .find({ maDocGia: /^DG\d+/ })
            .sort({ maDocGia: -1 })
            .limit(1)
            .toArray();

        let nextNumber = 1;
        if (lastDocGia.length > 0 && lastDocGia[0].maDocGia) {
            const currentMaxNumber = parseInt(lastDocGia[0].maDocGia.replace("DG", ""), 10);
            if (!isNaN(currentMaxNumber)) {
                nextNumber = currentMaxNumber + 1;
            }
        }

        const autoMaDocGia = `DG${String(nextNumber).padStart(4, "0")}`;

        const newDocGia = {
            maDocGia: autoMaDocGia,
            hoTen: hoTen,
            tenTaiKhoan: tenTaiKhoan,
            matKhau: matKhau,
            email: email,
            ngaySinh: ngaySinh,
            gioiTinh: gioiTinh,
            diaChi: diaChi,
            dienThoai: dienThoai,
            trangThaiTaiKhoan: 1
        };

        console.log("[DEBUG AUTH - REGISTER SUCCESS] Document chuẩn bị Insert vào MongoDB:");
        console.log(JSON.stringify(newDocGia, null, 2));

        const result = await docGiaCollection.insertOne(newDocGia);

        console.log("==================================================\n");

        return res.status(201).send({
            message: "Đăng ký tài khoản thành công!",
            docGia: {
                id: result.insertedId,
                ...newDocGia
            }
        });

    } catch (error) {
        console.error("[DEBUG AUTH - REGISTER ERROR] Lỗi hệ thống:", error);
        console.log("==================================================\n");
        return next(new ApiError(500, `Lỗi đăng ký tài khoản: ${error.message}`));
    }
};

exports.logout = async (req, res, next) => {
    console.log("\n==================================================");
    console.log("[DEBUG AUTH - LOGOUT] Người dùng yêu cầu đăng xuất.");
    console.log("==================================================\n");
    return res.status(200).send({ message: "Đăng xuất thành công!" });
};