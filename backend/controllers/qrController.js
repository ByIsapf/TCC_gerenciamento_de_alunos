const db = require("../config/database");

async function registrarPresenca(req, res) {

    const { token } = req.query;

    try {

        // =========================
        // VERIFICA SE O TOKEN FOI ENVIADO
        // =========================

        if (!token) {
            return res.status(400).json({
                mensagem: "Token não informado."
            });
        }


        // =========================
        // PROCURA O TOKEN E O ALUNO
        // =========================

        const [tokens] = await db.query(
            `SELECT
                qr_tokens.*,
                alunos.nome
             FROM qr_tokens
             INNER JOIN alunos
                ON qr_tokens.aluno_id = alunos.id
             WHERE qr_tokens.token = ?`,
            [token]
        );


        // Token não existe
        if (tokens.length === 0) {

            return res.status(401).json({
                mensagem: "QR Code inválido."
            });

        }


        const qrToken = tokens[0];


        // =========================
        // VERIFICA SE JÁ FOI USADO
        // =========================

        if (qrToken.usado) {

            return res.status(401).json({
                mensagem: "Este QR Code já foi utilizado."
            });

        }


        // =========================
        // VERIFICA SE EXPIROU
        // =========================

        if (new Date(qrToken.expiracao) < new Date()) {

            return res.status(401).json({
                mensagem: "Este QR Code expirou."
            });

        }


        // =========================
        // VERIFICA PRESENÇA DO DIA
        // =========================

        const [frequencias] = await db.query(
            `SELECT *
             FROM frequencias
             WHERE aluno_id = ?
             AND data = CURDATE()`,
            [qrToken.aluno_id]
        );


        if (frequencias.length > 0) {

            return res.status(409).json({
                mensagem: "Sua presença já foi registrada hoje."
            });

        }


        // =========================
        // REGISTRA A PRESENÇA
        // =========================

        await db.query(
            `INSERT INTO frequencias
            (aluno_id, data, horario, status)
            VALUES (?, CURDATE(), CURTIME(), 'presente')`,
            [qrToken.aluno_id]
        );


        // =========================
        // MARCA O TOKEN COMO USADO
        // =========================

        await db.query(
            `UPDATE qr_tokens
             SET usado = TRUE
             WHERE id = ?`,
            [qrToken.id]
        );


        // =========================
        // BUSCA A PRESENÇA REGISTRADA
        // =========================

        const [presencas] = await db.query(
            `SELECT
                DATE_FORMAT(data, '%d/%m/%Y') AS data,
                TIME_FORMAT(horario, '%H:%i') AS horario
             FROM frequencias
             WHERE aluno_id = ?
             AND data = CURDATE()`,
            [qrToken.aluno_id]
        );


        const presenca = presencas[0];


        // =========================
        // RESPOSTA PARA O CELULAR
        // =========================

        res.json({

            mensagem: "Presença registrada com sucesso!",

            aluno: {
                nome: qrToken.nome
            },

            presenca: {
                data: presenca.data,
                horario: presenca.horario
            }

        });


    } catch (erro) {

        console.error(
            "Erro ao registrar presença:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro interno do servidor."
        });

    }
}


module.exports = {
    registrarPresenca
};