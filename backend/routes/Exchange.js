const express = require('express');
const router = express.Router();
const exchangeController = require('../controller/Exchang');
const ExchangeSchema  = require("../model/Exchange");
const controller  = require ("../controller/controller")

router.post('/', exchangeController.createExchange);
router.get('/history', exchangeController.getExchangeHistory);
router.get('/rates', exchangeController.getExchangeRates);
router.get("/historys/:customerId", (req, res) => {
    controller.getExchangeByCustomer(req, res, ExchangeSchema);
});

router.get("/by-account/:accountNo", async (req, res) => {
    try {
        const { accountNo } = req.params;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        console.log(`Fetching exchanges for account ${accountNo}, page ${page}, pageSize ${pageSize}`);
        
        // First find the customer by account number
        const Customer = require('../model/customer.model');
        const customer = await Customer.findOne({ accountNo: parseInt(accountNo) });
        
        if (!customer) {
            return res.status(404).json({
                message: "Customer not found",
                success: false
            });
        }

        // Then get exchanges for this customer
        const total = await ExchangeSchema.countDocuments({ customerId: customer._id });
        const exchanges = await ExchangeSchema.find({ customerId: customer._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({
            message: "Customer Exchange history fetched!",
            data: exchanges,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            },
            success: true
        });
    } catch (error) {
        console.error("Error in /by-account:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
