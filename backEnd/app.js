const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");

// Import các Router
const authRouter = require("./app/routes/auth.route");
const docGiaRouter = require("./app/routes/docgia.route");
const nhanVienRouter = require("./app/routes/nhanvien.route");
const nhaXuatBanRouter = require("./app/routes/nhaxuatban.route");
const sachRouter = require("./app/routes/sach.route");
const theoDoiMuonSachRouter = require("./app/routes/theodoimuonsach.route");
const phieuPhatRouter = require("./app/routes/phieuphat.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Library Management Application." });
});

// Đăng ký Route Auth
app.use("/api/auth", authRouter);

// Các Route hiện có
app.use("/api/docgia", docGiaRouter);
app.use("/api/nhanvien", nhanVienRouter);
app.use("/api/nhaxuatban", nhaXuatBanRouter);
app.use("/api/sach", sachRouter);
app.use("/api/muon-sach", theoDoiMuonSachRouter);
app.use("/api/phieu-phat", phieuPhatRouter);

// Handle 404 response
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

// Define error-handling middleware
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;