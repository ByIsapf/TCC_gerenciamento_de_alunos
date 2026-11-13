const db = require("../config/database");

async function resumoDashboard(req, res) {

    try {

        const [[alunosResult]] = await db.query(
            "SELECT COUNT(*) AS total FROM alunos"
        );

        const [[frequenciaResult]] = await db.query(
            `SELECT
                SUM(status = 'presente') AS presentes,
                SUM(status = 'atrasado') AS atrasados,
                SUM(status = 'falta') AS faltas
             FROM frequencias
             WHERE data = CURDATE()`
        );

        const [[turmasResult]] = await db.query("SELECT COUNT(*) AS total FROM turmas");
        const totalAlunos = Number(alunosResult.total || 0);
        const presentes = Number(frequenciaResult.presentes || 0);
        const atrasados = Number(frequenciaResult.atrasados || 0);

        // Alunos sem registro de frequência hoje são considerados ausentes.
        const faltas = Number(frequenciaResult.faltas || 0);
        const semRegistro = Math.max(totalAlunos - presentes - atrasados - faltas, 0);
        const ausentes = faltas + semRegistro;

        const percentual = (valor) => {
            if (totalAlunos === 0) return 0;
            return Number(((valor / totalAlunos) * 100).toFixed(1));
        };

        res.json({
            totalAlunos,
            totalTurmas: Number(turmasResult.total || 0),

            presentes,
            ausentes,
            faltas,
            semRegistro,
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
