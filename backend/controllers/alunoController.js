const bcrypt = require("bcrypt");
const db = require("../config/database");

async function loginAluno(req, res) {
    const { ra, senha } = req.body;

    try {
        const [alunos] = await db.query(
            "SELECT * FROM alunos WHERE ra = ?",
            [ra]
        );

        if (alunos.length === 0) {
            return res.status(401).json({
                mensagem: "RA ou senha inválidos."
            });
        }

        const aluno = alunos[0];

        const senhaValida = await bcrypt.compare(
            senha,
            aluno.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: "RA ou senha inválidos."
            });
        }

        res.json({
            mensagem: "Login realizado com sucesso!",
            aluno: {
                id: aluno.id,
                ra: aluno.ra,
                nome: aluno.nome
            }
        });

    } catch (erro) {
        console.error("Erro no login:", erro);

        res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
}

module.exports = {
    loginAluno
};