const express = require("express");
const router = express.Router();

const db = require("../config/database");

router.post("/login", async (req, res) => {

    try {

        const { senha } = req.body;

        if (!senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Digite a senha."
            });
        }

        const [resultado] = await db.execute(
            "SELECT id FROM gestao WHERE senha = ?",
            [senha]
        );

        if (resultado.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Senha incorreta."
            });
        }

        res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso."
        });

    } catch (erro) {

        console.error("Erro no login da gestão:", erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno do servidor."
        });
    }
});

module.exports = router;