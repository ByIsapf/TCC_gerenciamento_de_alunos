const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const db = require("./config/database");
const alunoRoutes = require("./routes/alunoRoutes");
const qrRoutes = require("./routes/qrRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authroutes");
const proteger = require("./middleware/authmiddleware");
const protegerAlteracoesAdmin = require("./middleware/protegerAlteracoesAdmin");

const app = express();
const turmasRoutes = require("./routes/turmasRoutes");

// Frontend e API usam a mesma origem; não liberar CORS indiscriminadamente.
app.disable("x-powered-by");
app.use((req,res,next)=>{
    res.setHeader("X-Content-Type-Options","nosniff");
    res.setHeader("Referrer-Policy","no-referrer");
    res.setHeader("X-Frame-Options","DENY");
    if(req.path.startsWith("/gestao/") || req.path.startsWith("/api/") || req.path.startsWith("/qr/") || req.path.startsWith("/auth/") || req.path.startsWith("/alunos/")) res.setHeader("Cache-Control","no-store");
    next();
});
app.use(express.json({limit:"16kb"}));
// Verifica origem em requisições que modificam dados; navegadores enviam Origin em fetch POST/PUT/DELETE.
app.use((req,res,next)=>{
    if(!["POST","PUT","PATCH","DELETE"].includes(req.method))return next();
    const origem=req.get("Origin");
    if(!origem)return next(); // Clientes não navegadores podem não enviar Origin; cookies SameSite reduzem CSRF.
    const host=req.get("Host");
    try {if(new URL(origem).host===host)return next();}catch(_){}
    return res.status(403).json({mensagem:"Origem da requisição não autorizada."});
});

// Permite acessar os arquivos do frontend pelo servidor
app.get("/gestao/:pagina", async (req,res,next)=>{
    if(!["dashboard.html","registrar-entrada.html","turmas.html","faltas.html","configuracoes.html"].includes(req.params.pagina))return next();
    proteger(req,res,()=>res.sendFile(require("path").join(__dirname,"../frontend/gestao",req.params.pagina)));
});
app.get("/config-publica.js",(req,res)=>{
    res.type("application/javascript");
    res.setHeader("Cache-Control","no-store");
    const configured=process.env.GEA_PUBLIC_URL || "";
    res.send("window.GEA_PUBLIC_URL = "+JSON.stringify(configured)+";");
});
app.use(express.static(require("path").join(__dirname, "../frontend")));

// Rotas
app.use("/alunos", alunoRoutes);
app.use("/qr", qrRoutes);
app.use("/dashboard", proteger, dashboardRoutes);
app.use("/api/turmas", proteger, protegerAlteracoesAdmin, turmasRoutes);
app.use("/api/alunos-admin", proteger, protegerAlteracoesAdmin, require("./routes/alunosAdminRoutes"));
app.use("/api/configuracoes", proteger, protegerAlteracoesAdmin, require("./routes/configuracoesRoutes"));
app.use("/auth", authRoutes);

// Rota para testar a conexão com o banco
app.get("/teste-db", async (req, res) => {
    try {
        const [resultado] = await db.query("SELECT 1");

        res.json({
            mensagem: "Conexão com o banco funcionando!",
            resultado
        });

    } catch (erro) {
        console.error("Erro ao conectar com o banco:", erro);

        res.status(500).json({
            mensagem: "Erro ao conectar com o banco."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor G.E.A rodando na porta ${PORT}`);
});