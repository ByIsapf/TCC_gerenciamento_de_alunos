
/* =========================================
   SISTEMA G.E.A
   AUTENTICAÇÃO DO ALUNO
   ========================================= */


/* =========================================
   IMPORTAÇÃO DE DEPENDÊNCIAS
   ========================================= */

const db = require("../config/database");
const crypto = require("crypto");


/* =========================================
   MIDDLEWARE DE AUTENTICAÇÃO
   ========================================= */

module.exports = async (req, res, next) => {

    /* =====================================
       OBTER TOKEN DOS COOKIES
       ===================================== */

    const token = (req.headers.cookie || "")
        .split(";")
        .map(s => s.trim())
        .find(s => s.startsWith("gea_aluno="))
        ?.slice(10);


    /* =====================================
       VALIDAR TOKEN DO ALUNO
       ===================================== */

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {

        return res.status(401).json({
            mensagem: "Entre com RA e senha para confirmar."
        });

    }


    /* =====================================
       VERIFICAR SESSÃO DO ALUNO
       ===================================== */

    try {

        /* =================================
           GERAR HASH DO TOKEN
           ================================= */

        const hash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");


        /* =================================
           CONSULTAR SESSÃO NO BANCO
           ================================= */

        const [rows] = await db.query(
            `SELECT aluno_id
             FROM sessoes_aluno
             WHERE token_hash = ?
             AND expiracao > NOW()`,
            [hash]
        );


        /* =================================
           VERIFICAR VALIDADE DA SESSÃO
           ================================= */

        if (!rows.length) {

            return res.status(401).json({
                mensagem: "Sessão do aluno expirada."
            });

        }


        /* =================================
           IDENTIFICAR ALUNO AUTENTICADO
           ================================= */

        req.alunoId = rows[0].aluno_id;


        /* =================================
           CONTINUAR REQUISIÇÃO
           ================================= */

        next();

    } catch (e) {

        /* =================================
           TRATAMENTO DE ERROS
           ================================= */

        console.error(e);

        res.status(500).json({
            mensagem: "Erro na sessão do aluno."
        });

    }

};
