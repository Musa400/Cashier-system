const express = require('express');
const router = express.Router();

const logincontroller = require("../controller/login.controller");
const userSchema = require("../model/users.model")

router.post('/', (req, res) => {
  logincontroller.loginFunc(req, res, userSchema);

})

module.exports = router;