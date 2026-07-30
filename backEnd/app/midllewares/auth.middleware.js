const jwt = require("jsonwebtoken");

// Middleware kiểm tra Token
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.error("[DEBUG BACKEND - Auth Middleware] No token provided.");
        return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
        req.user = decoded;
        console.log(`[DEBUG BACKEND - Auth Middleware] User authenticated: ${decoded.maNguoiDung}`);
        next();
    } catch (err) {
        console.error("[DEBUG BACKEND - Auth Middleware] Invalid token:", err.message);
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

// Middleware kiểm tra quyền Admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        console.error(`[DEBUG BACKEND - Auth Middleware] Access denied for role: ${req.user?.role}`);
        return res.status(403).json({ message: "Chức năng này chỉ dành cho Admin/Nhân viên!" });
    }
};