const express = require("express");

const router = express.Router();

const {
    resumoDashboard
} = require("../controllers/dashboardController");

router.get("/resumo", resumoDashboard);

module.exports = router;
