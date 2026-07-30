const express = require("express");
const docGia = require("../controllers/docgia.controller");

const router = express.Router();

router.post("/register", docGia.register);
router.post("/login", docGia.login);

router.route("/")
    .get(docGia.findAll);

router.route("/:id")
    .get(docGia.findOne)
    .put(docGia.update)
    .delete(docGia.delete);

module.exports = router;