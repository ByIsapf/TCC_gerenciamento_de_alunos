// Limite por IP e tipo de login. Para implantação com vários servidores, usar armazenamento compartilhado.
const tentativas = new Map();
const JANELA = 15 * 60 * 1000;
const MAX = 8;
function limitarLogin(tipo) {
  return (req, res, next) => {
    const agora = Date.now();
    const chave = tipo + ':' + req.ip;
    const dados = tentativas.get(chave);
    if (dados && dados.expira > agora && dados.total >= MAX) {
      res.setHeader('Retry-After', String(Math.ceil((dados.expira - agora) / 1000)));
      return res.status(429).json({ mensagem: 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.' });
    }
    if (dados && dados.expira <= agora) tentativas.delete(chave);
    res.locals.registrarFalhaLogin = () => {
      const atual = tentativas.get(chave);
      if (!atual || atual.expira <= Date.now()) tentativas.set(chave, {total: 1, expira: Date.now() + JANELA});
      else atual.total++;
    };
    res.locals.limparFalhasLogin = () => tentativas.delete(chave);
    next();
  };
}
setInterval(() => { const agora = Date.now(); for (const [k, v] of tentativas) if (v.expira <= agora) tentativas.delete(k); }, JANELA).unref();
module.exports = limitarLogin;
