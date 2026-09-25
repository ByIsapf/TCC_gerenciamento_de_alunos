const express = require("express");

const router = express.Router();

const { loginAluno } = require("../controllers/alunoController");

router.post("/login", loginAluno);

module.exports = router;