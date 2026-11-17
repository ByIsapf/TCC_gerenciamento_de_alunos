
/* =========================================
   SISTEMA G.E.A
   CADASTRO DE ADMINISTRADOR
   ========================================= */


/* =========================================
   CONFIGURAÇÃO DO AMBIENTE
   ========================================= */

require("dotenv").config({
    path: require("path").join(__dirname, "../.env")
});


/* =========================================
   IMPORTAÇÃO DE DEPENDÊNCIAS
   ========================================= */

const bcrypt = require("bcrypt");
const db = require("../config/database");


/* =========================================
   CADASTRAR ADMINISTRADOR
   ========================================= */

(async () => {

    /* =====================================
       RECEBER EMAIL E SENHA
       ===================================== */

    const [email, senha] = process.argv.slice(2);


    /* =====================================
       VALIDAR DADOS RECEBIDOS
       ===================================== */

    if (!email || !senha || senha.length < 10) {

        console.error(
            "Uso: node scripts/criarAdmin.js email senha-com-10-ou-mais-caracteres"
        );

        process.exitCode = 1;

        return;
    }


    /* =====================================
       CADASTRAR OU ATUALIZAR ADMINISTRADOR
       ===================================== */

    await db.query(
        `INSERT INTO administradores (email, senha)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE
         senha = VALUES(senha)`,
        [
            email,
            await bcrypt.hash(senha, 12)
        ]
    );


    /* =====================================
       CONFIRMAR CADASTRO
       ===================================== */

    console.log("Administrador cadastrado.");

})()


/* =========================================
   TRATAMENTO DE ERROS
   ========================================= */

.catch(e => {

    console.error(e);

    process.exitCode = 1;

})


/* =========================================
   ENCERRAR CONEXÃO COM O BANCO
   ========================================= */

.finally(() => db.end());
