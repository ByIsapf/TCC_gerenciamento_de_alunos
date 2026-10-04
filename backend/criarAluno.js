require("dotenv").config({ path: "./backend/.env" });

const bcrypt = require("bcrypt");
const db = require("./config/database");

async function criarAluno() {

    try {

        const senhaCriptografada =
            await bcrypt.hash("123456", 10);

        await db.query(
            `INSERT INTO alunos (ra, nome, senha)
             VALUES (?, ?, ?)`,
            ["87654321", "Erick", senhaCriptografada]
        );

        console.log("Aluno Erick criado com sucesso!");

        process.exit(0);

    } catch (erro) {

        console.error(
            "Erro ao criar aluno:",
            erro
        );

        process.exit(1);
    }

}

criarAluno();