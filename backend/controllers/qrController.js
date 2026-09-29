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
        // PROCURA O TOKEN NO BANCO
        // =========================

        const [tokens] = await db.query(
            `SELECT *
             FROM qr_tokens
             WHERE token = ?`,
            [token]
        );


        // Se o token não existir
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
        // VERIFICA SE JÁ TEM PRESENÇA HOJE
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
                mensagem: "A presença deste aluno já foi registrada hoje."
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
        // PRESENÇA REGISTRADA
        // =========================

        res.json({
            mensagem: "Presença registrada com sucesso!"
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