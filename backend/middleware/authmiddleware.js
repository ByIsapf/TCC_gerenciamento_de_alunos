const crypto=require("crypto");
const db=require("../config/database");
module.exports=async function(req,res,next){
 const negar=(mensagem)=>{
   // Redireciona apenas navegação para páginas administrativas HTML.
   if(req.method==="GET" && /^\/gestao\/(?:dashboard|registrar-entrada|leitor|turmas|faltas|configuracoes)\.html$/.test(req.path))
     return res.redirect(303,"/secretaria/login.html");
   return res.status(401).json({mensagem});
 };
 const token=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("gea_admin="))?.slice(10);
 if(!token || !/^[a-f0-9]{64}$/.test(token))return negar("Acesso restrito à secretaria.");
 try{const hash=crypto.createHash("sha256").update(token).digest("hex");const [rows]=await db.query("SELECT administrador_id FROM sessoes_admin WHERE token_hash=? AND expiracao>NOW()",[hash]);if(!rows.length)return negar("Sessão expirada.");req.adminId=rows[0].administrador_id;next();}catch(e){console.error(e);res.status(500).json({mensagem:"Falha de autenticação."});}
};
