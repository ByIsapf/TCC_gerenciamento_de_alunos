const express = require("express");
const db = require("../config/database");
const router = express.Router();
const validarNome = n => typeof n === "string" && n.trim().length >= 2 && n.trim().length <= 100;
const idValido = x => /^[1-9]\d*$/.test(String(x));
const falha = (res,e) => { console.error("Turmas:",e); if(e.code === "ER_DUP_ENTRY") return res.status(409).json({mensagem:"Turma já cadastrada."}); res.status(500).json({mensagem:"Falha no banco. Confira a migração de turmas."}); };
router.get("/",async(req,res)=>{try{const [rows]=await db.query(`SELECT t.id,t.nome,COUNT(a.id) AS total_alunos FROM turmas t LEFT JOIN alunos a ON a.turma_id=t.id GROUP BY t.id,t.nome ORDER BY t.nome`);res.json(rows);}catch(e){falha(res,e)}});
router.post("/",async(req,res)=>{const nome=req.body?.nome;if(!validarNome(nome))return res.status(400).json({mensagem:"Nome deve ter entre 2 e 100 caracteres."});try{const [r]=await db.query("INSERT INTO turmas(nome) VALUES (?)",[nome.trim()]);res.status(201).json({id:r.insertId,nome:nome.trim()});}catch(e){falha(res,e)}});
router.put("/:id",async(req,res)=>{if(!idValido(req.params.id)||!validarNome(req.body?.nome))return res.status(400).json({mensagem:"ID ou nome inválido."});try{const [r]=await db.query("UPDATE turmas SET nome=? WHERE id=?",[req.body.nome.trim(),req.params.id]);if(!r.affectedRows)return res.status(404).json({mensagem:"Turma não encontrada."});res.json({mensagem:"Turma atualizada."});}catch(e){falha(res,e)}});
router.delete("/:id",async(req,res)=>{if(!idValido(req.params.id))return res.status(400).json({mensagem:"ID inválido."});try{const [[c]]=await db.query("SELECT COUNT(*) AS total FROM alunos WHERE turma_id=?",[req.params.id]);if(c.total)return res.status(409).json({mensagem:"Remova os vínculos dos alunos antes de excluir a turma, para preservar os dados."});const [r]=await db.query("DELETE FROM turmas WHERE id=?",[req.params.id]);if(!r.affectedRows)return res.status(404).json({mensagem:"Turma não encontrada."});res.json({mensagem:"Turma excluída."});}catch(e){falha(res,e)}});
router.get("/:id/alunos",async(req,res)=>{if(!idValido(req.params.id))return res.status(400).json({mensagem:"ID inválido."});try{const [rows]=await db.query(`SELECT a.id,a.ra,a.nome,COALESCE(f.status,'sem_registro') AS situacao, f.justificativa FROM alunos a LEFT JOIN frequencias f ON f.aluno_id=a.id AND f.data=CURDATE() WHERE a.turma_id=? ORDER BY a.nome`,[req.params.id]);res.json(rows);}catch(e){falha(res,e)}});
router.get("/alunos/disponiveis",async(req,res)=>{try{const [rows]=await db.query("SELECT id,ra,nome,turma_id FROM alunos ORDER BY nome");res.json(rows);}catch(e){falha(res,e)}});
router.put("/alunos/:id/turma",async(req,res)=>{const id=req.params.id, turma=req.body?.turma_id;if(!idValido(id)||!(turma===null||idValido(turma)))return res.status(400).json({mensagem:"Aluno ou turma inválidos."});try{if(turma!==null){const [[t]]=await db.query("SELECT COUNT(*) AS total FROM turmas WHERE id=?",[turma]);if(!t.total)return res.status(404).json({mensagem:"Turma não encontrada."});}const [r]=await db.query("UPDATE alunos SET turma_id=? WHERE id=?",[turma,id]);if(!r.affectedRows)return res.status(404).json({mensagem:"Aluno não encontrado."});res.json({mensagem:"Vínculo atualizado."});}catch(e){falha(res,e)}});
// Histórico individual: apenas registros existentes; ausência não é inferida.
router.get('/alunos/:id/historico',async(req,res)=>{
 if(!idValido(req.params.id))return res.status(400).json({mensagem:'ID inválido.'});
 try{
  const [a]=await db.query('SELECT id FROM alunos WHERE id=?',[req.params.id]);
  if(!a.length)return res.status(404).json({mensagem:'Aluno não encontrado.'});
  const [registros]=await db.query("SELECT DATE_FORMAT(data,'%Y-%m-%d') AS data,TIME_FORMAT(horario,'%H:%i') AS horario,status,justificativa FROM frequencias WHERE aluno_id=? ORDER BY data DESC,horario DESC LIMIT 500",[req.params.id]);
  res.json({registros,presentes:registros.filter(x=>x.status==='presente').length,atrasados:registros.filter(x=>x.status==='atrasado').length,faltas:registros.filter(x=>x.status==='falta').length,limitado:registros.length===500});
 }catch(e){falha(res,e)}
});
// A falta só pode ser registrada para hoje e por uma pessoa autenticada da secretaria.
router.post('/alunos/:id/falta',async(req,res)=>{
 if(!idValido(req.params.id))return res.status(400).json({mensagem:'Aluno inválido.'});
 const justificativa=req.body?.justificativa;
 if(justificativa!==undefined && (typeof justificativa!=='string'||justificativa.trim().length>500))return res.status(400).json({mensagem:'Justificativa deve ter até 500 caracteres.'});
 try{
  const [alunos]=await db.query('SELECT id FROM alunos WHERE id=?',[req.params.id]);
  if(!alunos.length)return res.status(404).json({mensagem:'Aluno não encontrado.'});
  await db.query("INSERT INTO frequencias(aluno_id,data,horario,status,justificativa) VALUES (?,CURDATE(),CURTIME(),'falta',?)",[req.params.id,justificativa?.trim()||null]);
  res.status(201).json({mensagem:'Falta registrada para hoje.'});
 }catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({mensagem:'Já existe um registro para este aluno hoje. Nenhum dado foi alterado.'});falha(res,e)}
});
// Permite desfazer somente a falta de hoje; presença e atraso nunca são apagados aqui.
router.delete('/alunos/:id/falta',async(req,res)=>{
 if(!idValido(req.params.id))return res.status(400).json({mensagem:'Aluno inválido.'});
 try{const [r]=await db.query("DELETE FROM frequencias WHERE aluno_id=? AND data=CURDATE() AND status='falta'",[req.params.id]);
  if(!r.affectedRows)return res.status(404).json({mensagem:'Não existe falta confirmada hoje para esse aluno.'});
  res.json({mensagem:'Falta de hoje desfeita.'});
 }catch(e){falha(res,e)}
});
module.exports=router;
