import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.error("[DEBUG BACKEND - Auth] No token provided");
        return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY", (err, user) => {
        if (err) {
            console.error("[DEBUG BACKEND - Auth] Invalid token:", err);
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
        }
        req.user = user; // { id, role: 'docgia' | 'admin', ... }
        next();
    });
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        console.error(`[DEBUG BACKEND - Auth] Access denied for user role: ${req.user?.role}`);
        return res.status(403).json({ message: "Quyền truy cập bị từ chối! Chỉ dành cho Admin/Nhân viên." });
    }
};