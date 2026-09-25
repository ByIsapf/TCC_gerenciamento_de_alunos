const bcrypt = require("bcrypt");
const crypto = require("crypto");

const db = require("../config/database");

async function loginAluno(req, res) {

    const { ra, senha } = req.body;

    try {

        // Procura o aluno pelo RA
        const [alunos] = await db.query(
            "SELECT * FROM alunos WHERE ra = ?",
            [ra]
        );

        // Se o aluno não existir
        if (alunos.length === 0) {

            return res.status(401).json({
                mensagem: "RA ou senha inválidos."
            });

        }

        const aluno = alunos[0];

        // Compara a senha digitada com a senha criptografada
        const senhaValida = await bcrypt.compare(
            senha,
            aluno.senha
        );

        // Se a senha estiver errada
        if (!senhaValida) {

            return res.status(401).json({
                mensagem: "RA ou senha inválidos."
            });

        }

        // =========================
        // GERA O TOKEN DO QR CODE
        // =========================

        const token = crypto.randomBytes(32).toString("hex");

        // Token válido por 5 minutos
        const expiracao = new Date(
            Date.now() + 5 * 60 * 1000
        );

        // Salva o token no banco
        await db.query(
            `INSERT INTO qr_tokens
            (aluno_id, token, expiracao)
            VALUES (?, ?, ?)`,
            [
                aluno.id,
                token,
                expiracao
            ]
        );

        // Envia a resposta para o frontend
        res.json({

            mensagem: "Login realizado com sucesso!",

            aluno: {
                id: aluno.id,
                ra: aluno.ra,
                nome: aluno.nome
            },

            token: token

        });

    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro interno do servidor."
        });

    }
}

module.exports = {
    loginAluno
};