console.log("1 - arquivo iniciou");

const bcrypt = require("bcrypt");
console.log("2 - bcrypt carregado");

const db = require("./config/database");
console.log("3 - banco carregado");

async function criarAluno() {
    console.log("4 - função iniciou");

    try {
        const senha = "123456";
        const senhaHash = await bcrypt.hash(senha, 10);

        console.log("5 - senha transformada");

        await db.query(
            `INSERT INTO alunos (ra, nome, senha)
             VALUES (?, ?, ?)`,
            ["12345678", "Aluno Teste", senhaHash]
        );

        console.log("Aluno criado com sucesso!");

    } catch (erro) {
        console.error("Erro ao criar aluno:", erro);

    } finally {
        await db.end();
    }
}

criarAluno();