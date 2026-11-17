const router = require('express').Router();
const db = require('../config/database');
const query = 'SELECT TIME_FORMAT(horario_entrada, "%H:%i") AS horario_entrada, tolerancia_minutos, TIME_FORMAT(horario_encerramento, "%H:%i") AS horario_encerramento FROM configuracoes_entrada WHERE id=1';
router.get('/', async (req,res)=>{try{const [[row]]=await db.query(query);if(!row)return res.status(503).json({mensagem:'Execute a migração de configurações.'});res.json(row);}catch(e){console.error(e);res.status(500).json({mensagem:'Erro ao carregar configurações.'});}});
router.put('/', async(req,res)=>{
 const {horario_entrada,tolerancia_minutos,horario_encerramento}=req.body||{};
 const time=x=>typeof x==='string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(x);
 if(!time(horario_entrada)||!time(horario_encerramento)||!Number.isInteger(tolerancia_minutos)||tolerancia_minutos<0||tolerancia_minutos>180)return res.status(400).json({mensagem:'Confira os horários e a tolerância (0 a 180 minutos).'});
 const [h,m]=horario_entrada.split(':').map(Number);const limite=h*60+m+tolerancia_minutos;
 const [eh,em]=horario_encerramento.split(':').map(Number);
 if(limite>=24*60||eh*60+em<=limite)return res.status(400).json({mensagem:'O encerramento deve ser posterior ao horário de entrada mais a tolerância, no mesmo dia.'});
 try{await db.query('UPDATE configuracoes_entrada SET horario_entrada=?, tolerancia_minutos=?, horario_encerramento=? WHERE id=1',[horario_entrada,tolerancia_minutos,horario_encerramento]);res.json({mensagem:'Configurações salvas.'});}catch(e){console.error(e);res.status(500).json({mensagem:'Não foi possível salvar.'});}
});
module.exports=router;
