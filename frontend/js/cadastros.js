
/* =========================================
   SISTEMA G.E.A
   CADASTRO DE ALUNOS E GERENCIAMENTO DE TURMAS
   ========================================= */


/* =========================================
   SELEÇÃO DE ELEMENTOS HTML
   ========================================= */

const $ = id => document.getElementById(id);


/* =========================================
   COMUNICAÇÃO COM A API
   ========================================= */

async function api(url, opts = {}) {

    const r = await fetch(url, {

        ...opts,

        headers: {
            "Content-Type": "application/json",
            ...(opts.headers || {})
        }

    });

    const d = await r.json();

    if (!r.ok) {

        throw Error(
            d.mensagem || "Falha na operação"
        );

    }

    return d;

}


/* =========================================
   VARIÁVEIS GLOBAIS
   ========================================= */

let turmas = [];

let alunos = [];


/* =========================================
   EXIBIR MENSAGENS
   ========================================= */

const aviso = m => {

    $("mensagemTurmas").textContent = m;

};


/* =========================================
   CARREGAR TURMAS E ALUNOS
   ========================================= */

async function carregar() {

    try {

        /* =================================
           CONSULTAR DADOS NO SERVIDOR
           ================================= */

        [turmas, alunos] = await Promise.all([

            api("/api/turmas"),

            api("/api/turmas/alunos/disponiveis")

        ]);


        /* =================================
           ARMAZENAR TURMA SELECIONADA
           ================================= */

        const sel = $("turmaGerenciar");

        const antigo = sel.value;


        /* =================================
           LIMPAR CAMPOS DE TURMAS
           ================================= */

        for (const id of [

            "turmaGerenciar",
            "cadTurma",
            "turmaVinculo"

        ]) {

            $(id).replaceChildren(

                new Option(

                    id === "turmaGerenciar"
                        ? "Selecione uma turma"
                        : "Sem turma",

                    ""

                )

            );

        }


        /* =================================
           ADICIONAR TURMAS AOS CAMPOS
           ================================= */

        for (const turma of turmas) {

            for (const id of [

                "turmaGerenciar",
                "cadTurma",
                "turmaVinculo"

            ]) {

                $(id).add(

                    new Option(
                        turma.nome,
                        turma.id
                    )

                );

            }

        }


        /* =================================
           RESTAURAR TURMA SELECIONADA
           ================================= */

        sel.value = antigo;


        /* =================================
           LIMPAR SELEÇÃO DE ALUNOS
           ================================= */

        $("alunoVinculo").replaceChildren(

            new Option(
                "Selecione um aluno",
                ""
            )

        );


        /* =================================
           ADICIONAR ALUNOS DISPONÍVEIS
           ================================= */

        for (const a of alunos) {

            $("alunoVinculo").add(

                new Option(
                    `${a.nome} — RA ${a.ra}`,
                    a.id
                )

            );

        }

    }

    /* =====================================
       TRATAMENTO DE ERROS
       ===================================== */

    catch (e) {

        aviso(e.message);

    }

}


/* =========================================
   CADASTRAR NOVA TURMA
   ========================================= */

$("formTurma").addEventListener(
    "submit",
    async e => {

        e.preventDefault();

        try {

            /* =================================
               ENVIAR NOVA TURMA
               ================================= */

            await api("/api/turmas", {

                method: "POST",

                body: JSON.stringify({

                    nome: $("nomeTurma").value

                })

            });


            /* =================================
               LIMPAR FORMULÁRIO
               ================================= */

            $("formTurma").reset();


            /* =================================
               EXIBIR CONFIRMAÇÃO
               ================================= */

            aviso("Turma cadastrada.");


            /* =================================
               ATUALIZAR TURMAS
               ================================= */

            await carregar();

        }

        catch (err) {

            aviso(err.message);

        }

    }
);


/* =========================================
   RENOMEAR TURMA EXISTENTE
   ========================================= */

$("editarTurma").addEventListener(
    "click",
    async () => {

        /* =================================
           OBTER TURMA SELECIONADA
           ================================= */

        const id = $("turmaGerenciar").value;

        if (!id) {

            return aviso("Selecione uma turma.");

        }


        /* =================================
           SOLICITAR NOVO NOME
           ================================= */

        const nome = prompt(

            "Novo nome:",

            turmas.find(
                t => String(t.id) === id
            )?.nome

        );


        /* =================================
           VERIFICAR CANCELAMENTO
           ================================= */

        if (nome === null) {

            return;

        }


        /* =================================
           ATUALIZAR TURMA
           ================================= */

        try {

            await api(`/api/turmas/${id}`, {

                method: "PUT",

                body: JSON.stringify({
                    nome
                })

            });


            /* =================================
               EXIBIR CONFIRMAÇÃO
               ================================= */

            aviso("Turma renomeada.");


            /* =================================
               ATUALIZAR LISTAGEM
               ================================= */

            await carregar();

        }

        catch (e) {

            aviso(e.message);

        }

    }
);


/* =========================================
   EXCLUIR TURMA VAZIA
   ========================================= */

$("excluirTurma").addEventListener(
    "click",
    async () => {

        /* =================================
           OBTER TURMA SELECIONADA
           ================================= */

        const id = $("turmaGerenciar").value;

        if (!id) {

            return aviso("Selecione uma turma.");

        }


        /* =================================
           CONFIRMAR EXCLUSÃO
           ================================= */

        if (!confirm("Excluir turma vazia?")) {

            return;

        }


        /* =================================
           EXCLUIR TURMA
           ================================= */

        try {

            await api(`/api/turmas/${id}`, {

                method: "DELETE"

            });


            /* =================================
               LIMPAR SELEÇÃO
               ================================= */

            $("turmaGerenciar").value = "";


            /* =================================
               EXIBIR CONFIRMAÇÃO
               ================================= */

            aviso("Turma excluída.");


            /* =================================
               ATUALIZAR LISTAGEM
               ================================= */

            await carregar();

        }

        catch (e) {

            aviso(e.message);

        }

    }
);


/* =========================================
   VINCULAR ALUNO A UMA TURMA
   ========================================= */

$("formVinculo").addEventListener(
    "submit",
    async e => {

        e.preventDefault();


        /* =================================
           OBTER ALUNO SELECIONADO
           ================================= */

        const id = $("alunoVinculo").value;

        if (!id) {

            return aviso("Selecione um aluno.");

        }


        /* =================================
           SALVAR VÍNCULO
           ================================= */

        try {

            await api(
                `/api/turmas/alunos/${id}/turma`,
                {

                    method: "PUT",

                    body: JSON.stringify({

                        turma_id:
                            $("turmaVinculo").value || null

                    })

                }
            );


            /* =================================
               EXIBIR CONFIRMAÇÃO
               ================================= */

            aviso("Vínculo salvo.");


            /* =================================
               ATUALIZAR DADOS
               ================================= */

            await carregar();

        }

        catch (err) {

            aviso(err.message);

        }

    }
);


/* =========================================
   CADASTRAR NOVO ALUNO
   ========================================= */

$("formCadastroAluno").addEventListener(
    "submit",
    async e => {

        e.preventDefault();


        /* =================================
           ELEMENTOS DO CADASTRO
           ================================= */

        const btn = $("btnCadastrarAluno");

        const msg = $("mensagemCadastroAluno");


        /* =================================
           BLOQUEAR BOTÃO DURANTE CADASTRO
           ================================= */

        btn.disabled = true;

        msg.textContent = "Cadastrando...";


        /* =================================
           ENVIAR DADOS DO ALUNO
           ================================= */

        try {

            const d = await api("/api/alunos-admin", {

                method: "POST",

                body: JSON.stringify({

                    nome: $("cadNome").value.trim(),

                    ra: $("cadRa").value.trim(),

                    senha: $("cadSenha").value,

                    turma_id:
                        $("cadTurma").value || null

                })

            });


            /* =================================
               LIMPAR FORMULÁRIO
               ================================= */

            $("formCadastroAluno").reset();


            /* =================================
               EXIBIR CONFIRMAÇÃO
               ================================= */

            msg.textContent = d.mensagem;


            /* =================================
               ATUALIZAR ALUNOS E TURMAS
               ================================= */

            await carregar();

        }

        /* =================================
           TRATAMENTO DE ERROS
           ================================= */

        catch (err) {

            msg.textContent = err.message;

        }

        /* =================================
           LIBERAR BOTÃO NOVAMENTE
           ================================= */

        finally {

            btn.disabled = false;

        }

    }
);


/* =========================================
   INICIALIZAÇÃO DO SISTEMA
   ========================================= */

carregar();
