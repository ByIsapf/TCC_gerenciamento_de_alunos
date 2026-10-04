const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: "./backend/.env" });

const db = require("./config/database");
const alunoRoutes = require("./routes/alunoRoutes");
const qrRoutes = require("./routes/qrRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Permite acessar os arquivos do frontend pelo servidor
app.use(express.static("frontend"));

// Rotas
app.use("/alunos", alunoRoutes);
app.use("/qr", qrRoutes);

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