
/* =========================================
   SISTEMA G.E.A
   ROTAS DE QR CODE
   ========================================= */


/* =========================================
   IMPORTAÇÃO DE DEPENDÊNCIAS
   ========================================= */

const router = require("express").Router();

const admin = require("../middleware/authmiddleware");
const aluno = require("../middleware/alunoAuth");

const ctrl = require("../controllers/qrController");


/* =========================================
   VERIFICAÇÃO DE ORIGEM
   ========================================= */

function origem(req, res, next) {

    const o = req.get("Origin");

    if (o) {

        try {

            /* =================================
               IDENTIFICAR ORIGEM DA REQUISIÇÃO
               ================================= */

            const u = new URL(o);


            /* =================================
               VALIDAR DOMÍNIO E PROTOCOLO
               ================================= */

            if (
                u.host !== req.get("host") ||
                u.protocol !== (req.secure ? "https:" : "http:")
            ) {

                return res.status(403).json({
                    mensagem: "Origem não autorizada."
                });

            }

        } catch {

            /* =================================
               TRATAR ORIGEM INVÁLIDA
               ================================= */

            return res.status(403).json({
                mensagem: "Origem inválida."
            });

        }

    }

    /* =====================================
       CONTINUAR REQUISIÇÃO
       ===================================== */

    next();

}


/* =========================================
   GERAR QR CODE
   ACESSO DO ADMINISTRADOR
   ========================================= */

router.post(
    "/gerar",
    origem,
    admin,
    ctrl.gerar
);


/* =========================================
   REGISTRAR PRESENÇA
   ACESSO DO ALUNO
   ========================================= */

router.post(
    "/registrar",
    origem,
    aluno,
    ctrl.registrarPresenca
);


/* =========================================
   CONSULTAR QR CODE DO ALUNO
   ========================================= */

router.get(
    "/meu",
    aluno,
    ctrl.consultarMeuQr
);


/* =========================================
   EXPORTAÇÃO DAS ROTAS
   ========================================= */

module.exports = router;
