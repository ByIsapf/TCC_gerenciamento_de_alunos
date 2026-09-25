const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: "./backend/.env" });

const db = require("./config/database");
const alunoRoutes = require("./routes/alunoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Rotas dos alunos
app.use("/alunos", alunoRoutes);

app.get("/", (req, res) => {
    res.send("Backend do G.E.A funcionando!");
});

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

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});