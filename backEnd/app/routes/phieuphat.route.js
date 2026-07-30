const express = require("express");
const phieuPhat = require("../controllers/phieuphat.controller");

const router = express.Router();

router.route("/")
  .get(phieuPhat.findAll)
  .post(phieuPhat.create);

router.route("/:id/approve")
  .put(phieuPhat.approve);

module.exports = router;