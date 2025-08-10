const express = require('express');
const router = express.Router();
const exchangeController = require('../controller/Exchang');

router.post('/', exchangeController.createExchange);
router.get('/history', exchangeController.getExchangeHistory);
router.get('/rates', exchangeController.getExchangeRates);

module.exports = router;
