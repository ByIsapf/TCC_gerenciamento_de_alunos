
/* =========================================
   SISTEMA G.E.A
   ROTAS DE AUTENTICAÇÃO
   ========================================= */


/* =========================================
   IMPORTAÇÃO DE DEPENDÊNCIAS
   ========================================= */

const router = require("express").Router();

const auth = require("../controllers/authcontrollers");

const proteger = require("../middleware/authmiddleware");

const limitarLogin = require("../middleware/limitarLogin");


/* =========================================
   ROTA DE LOGIN DO ADMINISTRADOR
   ========================================= */

router.post(
    "/login",
    limitarLogin("admin"),
    auth.login
);


/* =========================================
   ROTA DE LOGOUT DO ADMINISTRADOR
   ========================================= */

router.post(
    "/logout",
    proteger,
    auth.logout
);


/* =========================================
   VERIFICAR AUTENTICAÇÃO
   ========================================= */

router.get(
    "/verificar",
    proteger,
    (req, res) => {

        res.json({
            autenticado: true
        });

    }
);


/* =========================================
   EXPORTAÇÃO DAS ROTAS
   ========================================= */

module.exports = router;
