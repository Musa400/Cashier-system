const express = require('express');
const router = express.Router();
const balanceController = require('../controller/balance.controller');

// Get total balance for a specific currency
router.get('/', balanceController.getBalanceByCurrency);

module.exports = router;
