"use strict";

// Camada adicional de proteção CSRF para operações administrativas.
// Requer um cabeçalho Origin ou Referer de mesma origem e rejeita
// explicitamente requisições cross-site indicadas pelo navegador.
module.exports = function protegerAlteracoesAdmin(req, res, next) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

  const fetchSite = req.get("Sec-Fetch-Site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) {
    return res.status(403).json({ mensagem: "Requisição de outra origem não autorizada." });
  }

  const origem = req.get("Origin") || req.get("Referer");
  if (!origem) {
    return res.status(403).json({ mensagem: "Origem da requisição não informada." });
  }

  try {
    const url = new URL(origem);
    const protocolo = req.secure ? "https:" : "http:";
    if (url.protocol !== protocolo || url.host !== req.get("Host") || url.username || url.password) {
      return res.status(403).json({ mensagem: "Origem da requisição não autorizada." });
    }
  } catch {
    return res.status(403).json({ mensagem: "Origem da requisição inválida." });
  }
  next();
};
