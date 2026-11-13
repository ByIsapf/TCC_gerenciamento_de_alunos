const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/database");

async function loginAluno(req, res) {

    const { ra, senha } = req.body || {};

    if (
        typeof ra !== "string" ||
        typeof senha !== "string"
    ) {

        return res.status(400).json({
            mensagem: "Informe RA e senha."
        });
    }

    try {
        const [rows] = await db.query(
            "SELECT id, ra, nome, senha FROM alunos WHERE ra = ?",
            [ra]
        );

        if (
            !rows.length ||
            !(await bcrypt.compare(senha, rows[0].senha))
        ) {

            res.locals.registrarFalhaLogin?.();
            return res.status(401).json({
                mensagem: "RA ou senha inválidos."
            });
        }

        res.locals.limparFalhasLogin?.();

        const token = crypto
            .randomBytes(32)
            .toString("hex");

        const hash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        await db.query(
            `INSERT INTO sessoes_aluno
             (aluno_id, token_hash, expiracao)
             VALUES (
                 ?,
                 ?,
                 DATE_ADD(NOW(), INTERVAL 2 HOUR)
             )`,
            [
                rows[0].id,
                hash
            ]
        );

        res.setHeader(
            "Set-Cookie",
            `gea_aluno=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=7200${
                process.env.NODE_ENV === "production"
                    ? "; Secure"
                    : ""
            }`
        );

        res.json({
            mensagem: "Login realizado.",
            aluno: {
                id: rows[0].id,
                ra: rows[0].ra,
                nome: rows[0].nome
            }
        });
    }

    catch (e) {
        console.error(e);
        res.status(500).json({
            mensagem:
                "Erro ao autenticar aluno. Confira a migração do banco."
        });
    }
}

async function logoutAluno(req, res) {

    try {
        const token = (req.headers.cookie || "")
            .split(";")
            .map(x => x.trim())
            .find(x => x.startsWith("gea_aluno="))
            ?.slice(10);

        if (token) {
            const hash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

            await db.query(
                "DELETE FROM sessoes_aluno WHERE token_hash = ?",
                [hash]
            );
        }

        res.setHeader(
            "Set-Cookie",
            `gea_aluno=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${
                process.env.NODE_ENV === "production"
                    ? "; Secure"
                    : ""
            }`
        );

        res.json({
            mensagem: "Sessão do aluno encerrada."
        });
    }

    catch (e) {
        console.error(e);
        res.status(500).json({
            mensagem: "Erro ao encerrar sessão."
        });
    }
}

module.exports = {
    loginAluno,
    logoutAluno
};