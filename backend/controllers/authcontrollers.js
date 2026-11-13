const db = require("../config/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const secureCookie = process.env.NODE_ENV === "production" ? "; Secure" : "";

async function login(req,res) {
  
  const {email,senha} = req.body || {};
  
  if(typeof email!=="string" || typeof senha!=="string") return res.status(400).json({mensagem:"Informe e-mail e senha."});
  
  try {
    const [users] = await db.query("SELECT id, senha FROM administradores WHERE email = ?",[email]);
    
    if(!users.length || !(await bcrypt.compare(senha,users[0].senha))) {res.locals.registrarFalhaLogin?.();
      return res.status(401).json({mensagem:"Credenciais inválidas."});}
    res.locals.limparFalhasLogin?.();

    const token=crypto.randomBytes(32).toString("hex");
    const hash=crypto.createHash("sha256").update(token).digest("hex");
    
    await db.query("INSERT INTO sessoes_admin (administrador_id, token_hash, expiracao) VALUES (?,?,DATE_ADD(NOW(), INTERVAL 8 HOUR))",[users[0].id,hash]);
    
    res.setHeader("Set-Cookie",`gea_admin=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secureCookie}`);
    res.json({mensagem:"Login realizado."});
  } catch(e){console.error(e);res.status(500).json({mensagem:"Erro no login."});}
}

async function logout(req,res){
  
  const token=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("gea_admin="))?.slice(10);
  
  if(token) await db.query("DELETE FROM sessoes_admin WHERE token_hash=?",[crypto.createHash("sha256").update(token).digest("hex")]).catch(console.error);
  res.setHeader("Set-Cookie",`gea_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie}`);res.json({mensagem:"Sessão encerrada."});
}

module.exports={login,logout};
