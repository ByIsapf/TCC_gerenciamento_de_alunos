
/* =========================================
   SISTEMA G.E.A
   CONFIGURAÇÕES DE ENTRADA DOS ALUNOS
   ========================================= */


/* =========================================
   ELEMENTOS DO FORMULÁRIO
   ========================================= */

const form = document.getElementById("config-form");

const msg = document.getElementById("mensagem");


/* =========================================
   CARREGAR CONFIGURAÇÕES DO SERVIDOR
   ========================================= */

async function carregar() {

    try {

        /* =================================
           CONSULTAR CONFIGURAÇÕES NA API
           ================================= */

        const r = await fetch("/api/configuracoes");

        const d = await r.json();


        /* =================================
           VERIFICAR ERROS DA REQUISIÇÃO
           ================================= */

        if (!r.ok) {

            throw Error(
                d.mensagem || "Falha ao carregar"
            );

        }


        /* =================================
           PREENCHER HORÁRIO DE ENTRADA
           ================================= */

        document.getElementById(
            "entrada"
        ).value = d.horario_entrada;


        /* =================================
           PREENCHER TOLERÂNCIA DE ATRASO
           ================================= */

        document.getElementById(
            "tolerancia"
        ).value = d.tolerancia_minutos;


        /* =================================
           PREENCHER HORÁRIO DE ENCERRAMENTO
           ================================= */

        document.getElementById(
            "encerramento"
        ).value = d.horario_encerramento;

    }

    /* =====================================
       TRATAMENTO DE ERROS
       ===================================== */

    catch (e) {

        msg.textContent = e.message;

    }

}


/* =========================================
   SALVAR CONFIGURAÇÕES DE ENTRADA
   ========================================= */

form.addEventListener(
    "submit",
    async e => {

        /* =================================
           IMPEDIR RECARREGAMENTO DA PÁGINA
           ================================= */

        e.preventDefault();


        /* =================================
           EXIBIR MENSAGEM DE CARREGAMENTO
           ================================= */

        msg.textContent = "Salvando...";


        /* =================================
           ENVIAR CONFIGURAÇÕES AO SERVIDOR
           ================================= */

        try {

            const r = await fetch(
                "/api/configuracoes",
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        /* HORÁRIO DE ENTRADA */

                        horario_entrada:
                            document.getElementById(
                                "entrada"
                            ).value,


                        /* TOLERÂNCIA DE ATRASO */

                        tolerancia_minutos:
                            Number(
                                document.getElementById(
                                    "tolerancia"
                                ).value
                            ),


                        /* HORÁRIO DE ENCERRAMENTO */

                        horario_encerramento:
                            document.getElementById(
                                "encerramento"
                            ).value

                    })

                }
            );


            /* =================================
               RECEBER RESPOSTA DO SERVIDOR
               ================================= */

            const d = await r.json();


            /* =================================
               VERIFICAR ERROS
               ================================= */

            if (!r.ok) {

                throw Error(
                    d.mensagem || "Erro ao salvar"
                );

            }


            /* =================================
               EXIBIR CONFIRMAÇÃO
               ================================= */

            msg.textContent = d.mensagem;

        }

        /* =================================
           TRATAMENTO DE ERROS
           ================================= */

        catch (e) {

            msg.textContent = e.message;

        }

    }
);


/* =========================================
   ENCERRAR SESSÃO DO ADMINISTRADOR
   ========================================= */

document.getElementById("sair").addEventListener(
    "click",
    e => {

        /* =================================
           IMPEDIR NAVEGAÇÃO AUTOMÁTICA
           ================================= */

        e.preventDefault();


        /* =================================
           SOLICITAR LOGOUT AO SERVIDOR
           ================================= */

        fetch("/auth/logout", {

            method: "POST"

        })

        /* =================================
           REDIRECIONAR PARA O LOGIN
           ================================= */

        .finally(() => {

            location.href = "../secretaria/login.html";

        });

    }
);


/* =========================================
   INICIALIZAÇÃO DA PÁGINA
   ========================================= */

carregar();
