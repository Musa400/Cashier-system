const express = require('express');
const router = express.Router();

const controller = require("../controller/controller");
const currencySechmea = require("../model/currency.model")

router.post('/', (req, res) => {
  controller.createData(req, res, currencySechmea);

})
router.get('/', (req, res) => {
  controller.getData(req, res, currencySechmea);

})
router.put('/:id', (req, res) => {
  controller.updateData(req, res, currencySechmea);

})
router.delete('/:id', (req, res) => {
  controller.deleteData(req, res, currencySechmea);

})

module.exports = router;