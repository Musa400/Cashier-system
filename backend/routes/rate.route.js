// routes/exchangeRateRoutes.js
const express = require('express');
const router = express.Router();
const exchangeRateController = require('../controller/Rate.controller');

router.get('/rates', exchangeRateController.getRates);
router.put('/rates', exchangeRateController.updateRate);

module.exports = router;
