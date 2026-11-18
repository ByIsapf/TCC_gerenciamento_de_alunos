const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/database");
const router = express.Router();
router.post("/", async (req, res) => {
  const { nome, ra, senha, turma_id } = req.body || {};
  if (typeof nome !== "string" || nome.trim().length < 2 || nome.trim().length > 100 ||
      typeof ra !== "string" || !/^[0-9]{4,20}$/.test(ra) ||
      typeof senha !== "string" || senha.length < 8 || senha.length > 72 ||
      !(turma_id == null || /^[1-9][0-9]*$/.test(String(turma_id))))
    return res.status(400).json({mensagem:"Informe nome, RA numérico, senha de 8 a 72 caracteres e turma válida."});
  try {
    if (turma_id != null) {
      const [turmas] = await db.query("SELECT id FROM turmas WHERE id=?", [turma_id]);
      if (!turmas.length) return res.status(404).json({mensagem:"Turma não encontrada."});
    }
    const hash = await bcrypt.hash(senha, 12);
    const [result] = await db.query("INSERT INTO alunos (nome,ra,senha,turma_id) VALUES (?,?,?,?)", [nome.trim(),ra,hash,turma_id ?? null]);
    res.status(201).json({mensagem:"Aluno cadastrado com sucesso.", aluno:{id:result.insertId,nome:nome.trim(),ra}});
  } catch(err) {
    if(err.code === "ER_DUP_ENTRY") return res.status(409).json({mensagem:"Esse RA já está cadastrado."});
    console.error("Cadastro de aluno:",err);
    res.status(500).json({mensagem:"Não foi possível cadastrar o aluno."});
  }
});
module.exports = router;
