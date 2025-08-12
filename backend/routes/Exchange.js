const express = require('express');
const router = express.Router();
const exchangeController = require('../controller/Exchang');
const ExcahangeSchema  = require("../model/Exchange");
const controller  = require ("../controller/controller")

router.post('/', exchangeController.createExchange);
router.get('/history', exchangeController.getExchangeHistory);
router.get('/rates', exchangeController.getExchangeRates);
router.get("/historys/:customerId", (req, res) => {
    controller.getExchangeByCustomer(req, res, ExcahangeSchema);
});

module.exports = router;
