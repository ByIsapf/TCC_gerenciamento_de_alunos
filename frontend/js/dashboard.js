async function carregarDashboard() {

    try {

        const resposta = await fetch("/dashboard/resumo");
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Não foi possível carregar o dashboard.");
        }

        document.getElementById("total-alunos").textContent = dados.totalAlunos;
        document.getElementById("total-turmas").textContent = dados.totalTurmas;

        document.getElementById("presentes-numero").textContent = dados.presentes;
        document.getElementById("resumo-frequencia").textContent =
            `${dados.ausentes} ausentes • ${dados.atrasados} atrasados`;

        atualizarIndicador("presentes", dados.presentes, dados.percentuais.presentes);
        atualizarIndicador("ausentes", dados.ausentes, dados.percentuais.ausentes);
        atualizarIndicador("atrasados", dados.atrasados, dados.percentuais.atrasados);

    } catch (erro) {

        console.error("Erro ao carregar dashboard:", erro);

        document.getElementById("resumo-frequencia").textContent =
            "Não foi possível carregar a frequência.";

    }

}


function atualizarIndicador(tipo, quantidade, porcentagem) {

    document.getElementById(`percent-${tipo}`).textContent = `${porcentagem}%`;
    document.getElementById(`count-${tipo}`).textContent = quantidade;
    document.getElementById(`bar-${tipo}`).style.width = `${porcentagem}%`;

}


document.addEventListener("DOMContentLoaded", carregarDashboard);
