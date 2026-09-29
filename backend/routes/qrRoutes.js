const express = require("express");

const router = express.Router();

const {
    registrarPresenca
} = require("../controllers/qrController");

router.get("/registrar", registrarPresenca);

module.exports = router;