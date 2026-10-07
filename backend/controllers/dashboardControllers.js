const db = require("../config/database");

async function resumoDashboard(req, res) {

    try {

        const [[alunosResult]] = await db.query(
            "SELECT COUNT(*) AS total FROM alunos"
        );

        const [[frequenciaResult]] = await db.query(
            `SELECT
                SUM(status = 'presente') AS presentes,
                SUM(status = 'atrasado') AS atrasados
             FROM frequencias
             WHERE data = CURDATE()`
        );

        const totalAlunos = Number(alunosResult.total || 0);
        const presentes = Number(frequenciaResult.presentes || 0);
        const atrasados = Number(frequenciaResult.atrasados || 0);

        // Alunos sem registro de frequência hoje são considerados ausentes.
        const ausentes = Math.max(totalAlunos - presentes - atrasados, 0);

        const percentual = (valor) => {
            if (totalAlunos === 0) return 0;
            return Number(((valor / totalAlunos) * 100).toFixed(1));
        };

        res.json({
            totalAlunos,
            // O projeto atual não possui tabela de turmas no banco.
            // Mantemos o número exibido no dashboard até a criação dessa tabela.
            totalTurmas: 12,

            presentes,
            ausentes,
            atrasados,

            percentuais: {
                presentes: percentual(presentes),
                ausentes: percentual(ausentes),
                atrasados: percentual(atrasados)
            }
        });

    } catch (erro) {

        console.error("Erro ao carregar resumo do dashboard:", erro);

        res.status(500).json({
            mensagem: "Erro ao carregar os dados do dashboard."
        });

    }
}

module.exports = {
    resumoDashboard
};
