const express = require("express");
const borrow = require("../controllers/theodoimuonsach.controller");

const router = express.Router();

router.route("/")
    .get(borrow.findAll)
    .post(borrow.create);

router.route("/docgia/:maDocGia")
    .get(borrow.getLichSuByDocGia);

router.route("/:id/tra-sach")
    .put(borrow.traSach);

router.route("/:id/trang-thai")
    .put(borrow.updateTrangThai);

module.exports = router;