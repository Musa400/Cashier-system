const express = require("express");
const router = express.Router();
const controller  = require("../controller/controller");

const customerSchema  = require("../model/customer.model");

router.get('/',(req,res)=>{
    controller.getData(req,res,customerSchema)
})

router.get('/store-account', (req, res) => {
    controller.getCurrencySummary(req, res);
});
router.get('/bank-account', (req, res) => {
    controller.getBankCurrencyTotals(req, res);
});

router.post('/',(req,res)=>{
    controller.createData(req,res,customerSchema)
})
router.put('/:id',(req,res)=>{
    controller.updateData(req,res,customerSchema)
})
router.delete('/:id',(req,res)=>{
    controller.deleteData(req,res,customerSchema)
})

module.exports = router
