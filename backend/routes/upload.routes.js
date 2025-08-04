const express = require('express');
const router = express.Router();

const uploadControler = require('../controller/upload.controller');
const upload = require('../services/upload.service');

router.post("/",upload.single("file"),uploadControler.uploadFile)

module.exports = router;