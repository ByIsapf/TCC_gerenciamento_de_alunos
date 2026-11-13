const db = require("../config/database");
const crypto = require("crypto");

const codigosVisiveis = new Map();

async function consultarMeuQr(req, res) {
    try {

        const [registrado] = await db.query(
            `SELECT id
             FROM frequencias
             WHERE aluno_id = ?
             AND data = CURDATE()
             LIMIT 1`,
            [req.alunoId]
        );

        if (registrado.length) {
            codigosVisiveis.delete(req.alunoId);
            return res.json({
                situacao: "registrada"
            });
        }

        const codigo = codigosVisiveis.get(
            req.alunoId
        );

        if (
            !codigo ||
            codigo.expiraEm <= Date.now()
        ) {
            codigosVisiveis.delete(req.alunoId);
            return res.json({
                situacao: "aguardando"
            });
        }

        const [valido] = await db.query(
            `SELECT id
             FROM qr_tokens
             WHERE aluno_id = ?
             AND token = ?
             AND usado = FALSE
             AND expiracao > NOW()
             LIMIT 1`,
            [
                req.alunoId,
                codigo.hash
            ]
        );

        if (!valido.length) {
            codigosVisiveis.delete(req.alunoId);
            return res.json({
                situacao: "aguardando"
            });
        }

        return res.json({
            situacao: "liberado",
            token: codigo.token,
            validadeSegundos: Math.max(
                0,
                Math.ceil(
                    (codigo.expiraEm - Date.now()) / 1000
                )
            )
        });
    }

    catch (e) {
        console.error(e);
        return res.status(500).json({
            mensagem: "Não foi possível consultar o QR Code."
        });
    }
}

async function gerar(req, res) {

    const ra = req.body?.ra;

    if (
        typeof ra !== "string" ||
        !/^.{1,20}$/.test(ra)
    ) {
        return res.status(400).json({
            mensagem: "Informe um RA válido."
        });
    }

    try {

        const [alunos] = await db.query(
            `SELECT id, ra, nome
             FROM alunos
             WHERE ra = ?`,
            [ra]
        );

        if (!alunos.length) {
            return res.status(404).json({
                mensagem: "Aluno não encontrado."
            });
        }

        const a = alunos[0];

        const [frequencias] = await db.query(
            `SELECT id
             FROM frequencias
             WHERE aluno_id = ?
             AND data = CURDATE()`,
            [a.id]
        );

        if (frequencias.length) {
            return res.status(409).json({
                mensagem: "Entrada já registrada hoje."
            });
        }

        const token = crypto
            .randomBytes(32)
            .toString("hex");

        const hash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        await db.query(
            `INSERT INTO qr_tokens
             (aluno_id, token, expiracao, usado)
             VALUES (
                 ?,
                 ?,
                 DATE_ADD(NOW(), INTERVAL 60 SECOND),
                 FALSE
             )`,
            [
                a.id,
                hash
            ]
        );

        codigosVisiveis.set(a.id, {
            token,
            hash,
            expiraEm: Date.now() + 60000
        });

        res.json({
            aluno: {
                ra: a.ra,
                nome: a.nome
            },
            token,
            validadeSegundos: 60
        });
    }

    catch (e) {
        console.error(e);
        res.status(500).json({
            mensagem: "Não foi possível gerar o QR Code."
        });
    }
}

async function registrarPresenca(req, res) {

    const token = req.body?.token;

    if (
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/.test(token)
    ) {
        return res.status(400).json({
            mensagem: "QR Code inválido."
        });
    }

    let conn;

    try {

        conn = await db.getConnection();

        await conn.beginTransaction();

        const hash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const [rows] = await conn.query(
            `SELECT
                q.id,
                q.aluno_id,
                a.nome
             FROM qr_tokens q
             JOIN alunos a
                ON a.id = q.aluno_id
             WHERE q.token = ?
             AND q.usado = FALSE
             AND q.expiracao > NOW()
             FOR UPDATE`,
            [hash]
        );

        if (!rows.length) {
            await conn.rollback();
            return res.status(401).json({
                mensagem: "Código inválido, expirado ou utilizado."
            });
        }

        const q = rows[0];

        if (q.aluno_id !== req.alunoId) {
            await conn.rollback();
            return res.status(403).json({
                mensagem: "Este QR Code pertence a outro aluno."
            });
        }

        const [old] = await conn.query(
            `SELECT id
             FROM frequencias
             WHERE aluno_id = ?
             AND data = CURDATE()`,
            [q.aluno_id]
        );

        if (old.length) {
            await conn.rollback();
            return res.status(409).json({
                mensagem: "Entrada já registrada hoje."
            });
        }

        const [[cfg]] = await conn.query(
            `SELECT
                TIME_FORMAT(
                    horario_entrada,
                    "%H:%i"
                ) AS entrada,
                tolerancia_minutos AS tolerancia,
                TIME_FORMAT(
                    horario_encerramento,
                    "%H:%i"
                ) AS encerramento
             FROM configuracoes_entrada
             WHERE id = 1`
        );

        if (!cfg) {
            await conn.rollback();
            return res.status(503).json({
                mensagem:
                    "Configuração de entrada não encontrada. Execute a migração."
            });
        }

        const [[clock]] = await conn.query(
            `SELECT TIME_FORMAT(
                CURTIME(),
                '%H:%i'
             ) AS horario`
        );

        const minutes = s =>
            Number(s.slice(0, 2)) * 60 +
            Number(s.slice(3, 5));

        const agora = minutes(
            clock.horario
        );
        const limite =
            minutes(cfg.entrada) +
            Number(cfg.tolerancia);

        if (agora < minutes(cfg.entrada)) {
            await conn.rollback();
            return res.status(403).json({
                mensagem:
                    `O registro de entrada só é permitido a partir das ${cfg.entrada}.`
            });
        }

        if (agora > minutes(cfg.encerramento)) {
            await conn.rollback();
            return res.status(403).json({
                mensagem:
                    "O horário de registro de entrada foi encerrado."
            });
        }

        const status = agora > limite
            ? "atrasado"
            : "presente";


        await conn.query(
            `INSERT INTO frequencias
             (aluno_id, data, horario, status)
             VALUES (
                 ?,
                 CURDATE(),
                 CURTIME(),
                 ?
             )`,
            [
                q.aluno_id,
                status
            ]
        );

        await conn.query(
            `UPDATE qr_tokens
             SET usado = TRUE
             WHERE id = ?`,
            [q.id]
        );

        await conn.commit();

        codigosVisiveis.delete(
            q.aluno_id
        );

        res.json({
            mensagem: "Entrada confirmada!",
            aluno: {
                nome: q.nome
            },
            presenca: {
                horario: clock.horario,
                status
            }
        });
    }

    catch (e) {
        if (conn) {
            await conn.rollback().catch(() => {});
        }

        console.error(e);

        res.status(
            e.code === "ER_DUP_ENTRY" ? 409 : 500
        ).json({

            mensagem:
                e.code === "ER_DUP_ENTRY"
                    ? "Entrada já registrada hoje."
                    : "Erro ao registrar presença."
        });
    }

    finally {
        if (conn) {
            conn.release();
        }
    }
}

module.exports = {
    gerar,
    registrarPresenca,
    consultarMeuQr
};