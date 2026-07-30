const express = require("express");
const auth = require("../controllers/auth.controller");

const router = express.Router();

// Định tuyến đăng nhập
router.post("/login-docgia", auth.loginDocGia);
router.post("/login-nhanvien", auth.loginNhanVien);
router.post("/login", auth.login); 
router.post("/register", auth.registerDocGia);
router.post("/logout", auth.logout);

module.exports = router;