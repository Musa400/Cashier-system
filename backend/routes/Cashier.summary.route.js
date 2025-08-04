const express = require("express");
const router = express.Router();
const controller = require("../controller/cashierSummary.controller");

// ټول معلومات راوړل
router.get("/", controller.getAllCashSummary);

// د ډیرو ریکارډونو ثبتول
router.post("/bulk", controller.addBulkCashSummary);

module.exports = router;
