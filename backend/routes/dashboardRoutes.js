const express = require("express");

const router = express.Router();

const {
    resumoDashboard
} = require("../controllers/dashboardControllers");

router.get("/resumo", resumoDashboard);

module.exports = router;
