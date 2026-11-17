const express = require("express");

const router = express.Router();

const { loginAluno, logoutAluno } = require("../controllers/alunoController");
const limitarLogin = require("../middleware/limitarLogin");
const alunoAuth = require("../middleware/alunoAuth");

router.post("/login", limitarLogin("aluno"), loginAluno);
router.post("/logout", logoutAluno);

module.exports = router;