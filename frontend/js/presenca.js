
/* =========================================
   SISTEMA G.E.A
   CONFIRMAÇÃO DE PRESENÇA DO ALUNO
   ========================================= */


/* =========================================
   OBTENÇÃO DO TOKEN DO QR CODE
   ========================================= */

const params = new URLSearchParams(location.search);
const token = params.get("token");


/* =========================================
   ELEMENTOS DA INTERFACE
   ========================================= */

const titulo = document.getElementById("status-titulo");
const msg = document.getElementById("status-mensagem")
const det = document.getElementById("dados-presenca");
const icone = document.getElementById("status-icon");


/* =========================================
   OCULTAR DADOS INICIALMENTE
   ========================================= */

det.style.display = "none";

/* =========================================
   DEFINIR ÍCONE DE STATUS
   ========================================= */

function definirIcone(sucesso) {
    icone.textContent = sucesso ? "✓" : "✕";
    icone.classList.toggle(
        "status-sucesso",
        sucesso
    );

    icone.classList.toggle(
        "status-erro",
        !sucesso
    );

}


/* =========================================
   EXIBIR MENSAGENS NA TELA
   ========================================= */

function informar(t, m) {
    titulo.textContent = t;
    msg.textContent = m;
}


/* =========================================
   CONFIRMAR ENTRADA DO ALUNO
   ========================================= */

async function confirmar() {


    /* =====================================
       VALIDAR TOKEN DO QR CODE
       ===================================== */

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
        definirIcone(false);
        informar(
            "QR Code inválido",
            "Solicite outro código à secretaria."
        );
        return;
    }


    /* =====================================
       ENVIAR CONFIRMAÇÃO AO SERVIDOR
       ===================================== */

    try {
        const r = await fetch("/qr/registrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token
            })
        });

        /* =================================
           RECEBER RESPOSTA DO SERVIDOR
           ================================= */

        const d = await r.json();

        /* =================================
           VERIFICAR AUTENTICAÇÃO DO ALUNO
           ================================= */

        if (
            r.status === 401 &&
            d.mensagem?.includes("Entre com RA")
        ) {

            /* SALVAR TOKEN PENDENTE */

            sessionStorage.setItem(
                "gea_qr_pendente",
                token
            );


            /* EXIBIR MENSAGEM DE LOGIN */

            definirIcone(false);
            informar(
                "Login necessário",
                "Entre com RA e senha para confirmar sua identidade."
            );

            /* CRIAR LINK PARA LOGIN */

            const a = document.createElement("a");
            a.href = "/index.html";
            a.textContent = "Entrar como aluno";
            msg.after(a);
            return;
        }

        /* =================================
           VERIFICAR ERROS DO SERVIDOR
           ================================= */

        if (!r.ok) {
            throw Error(d.mensagem);
        }

        /* =================================
           CONFIRMAR PRESENÇA
           ================================= */

        definirIcone(true);
        informar(
            "Entrada confirmada!",
            d.presenca.status === "atrasado"
                ? "Atraso registrado."
                : "Presença registrada."
        );

        /* =================================
           EXIBIR DADOS DA PRESENÇA
           ================================= */

        det.style.display = "";

        /* NOME DO ALUNO */

        document.getElementById(
            "nome-aluno"
        ).textContent = d.aluno.nome;

        /* DATA DA PRESENÇA */

        document.getElementById(
            "data-presenca"
        ).textContent = new Date().toLocaleDateString(
            "pt-BR"
        );

        /* HORÁRIO DA PRESENÇA */

        document.getElementById(
            "horario-presenca"
        ).textContent = d.presenca.horario;

        /* =================================
           REMOVER TOKEN DA URL
           ================================= */

        history.replaceState(
            null,
            "",
            "/presenca.html"
        );
    }

    /* =====================================
       TRATAMENTO DE ERROS
       ===================================== */

    catch (e) {
        definirIcone(false);
        informar(
            "Não foi possível confirmar",
            e.message
        );
    }
}

/* =========================================
   CRIAR BOTÃO DE CONFIRMAÇÃO
   ========================================= */

const btn = document.createElement("button");
btn.textContent = "Confirmar minha entrada";

/* =========================================
   EVENTO DO BOTÃO
   ========================================= */

btn.onclick = () => {
    btn.disabled = true;
    confirmar();
};

/* =========================================
   ADICIONAR BOTÃO À PÁGINA
   ========================================= */

msg.after(btn);

/* =========================================
   ESTADO INICIAL DA PÁGINA
   ========================================= */

icone.textContent = "•";
informar(
    "Confirmar entrada",
    "Verifique se você está conectado à sua conta de aluno e confirme."
);