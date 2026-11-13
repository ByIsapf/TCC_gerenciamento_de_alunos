const $ = id => document.getElementById(id);
async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw Error(data.mensagem || 'Erro na solicitação');
  return data;
}
let turmas = [];
async function carregar() {
  try {
    turmas = await api('/api/turmas');
    const select = $('selectTurma');
    select.replaceChildren(new Option('Selecione uma turma', ''));
    for (const t of turmas) select.add(new Option(`${t.nome} (${t.total_alunos} alunos)`, t.id));
  } catch (e) { $('mensagemTurmas').textContent = e.message; }
}
async function mostrarAlunos() {
  const id = $('selectTurma').value, lista = $('listaAlunos');
  lista.replaceChildren(); $('historicoAluno').hidden = true;
  $('mensagemTurmas').textContent = '';
  if (!id) { $('tituloTurma').textContent = 'Selecione uma turma'; $('contadorAlunos').textContent = '0 alunos'; lista.textContent = 'Escolha uma turma para consultar.'; return; }
  const turma = turmas.find(t => String(t.id) === id);
  $('tituloTurma').textContent = turma?.nome || 'Turma';
  try {
    const alunos = await api(`/api/turmas/${id}/alunos`);
    $('contadorAlunos').textContent = `${alunos.length} alunos`;
    if (!alunos.length) { lista.textContent = 'Nenhum aluno vinculado.'; return; }
    for (const a of alunos) {
      const linha = document.createElement('div'); linha.className = 'aluno-linha';
      const nome = document.createElement('span'); nome.className = 'aluno-nome'; nome.textContent = a.nome; const ra = document.createElement('small'); ra.className = 'aluno-ra'; ra.textContent = `RA ${a.ra}`; const identificacao = document.createElement('div'); identificacao.className = 'aluno-identificacao'; identificacao.append(nome, ra);
      const status = document.createElement('span'); status.className = 'aluno-situacao';
      status.textContent = ({sem_registro:'Sem registro hoje',falta:'Falta confirmada',presente:'Presente',atrasado:'Atrasado'})[a.situacao] || a.situacao;
      const historico = document.createElement('button'); historico.type = 'button'; historico.className = 'botao-historico'; historico.textContent = 'Ver histórico';
      historico.addEventListener('click', () => mostrarHistorico(a));
      const acoes = document.createElement('div'); acoes.className = 'aluno-acoes'; acoes.append(historico); linha.append(identificacao, status, acoes);
      if (a.situacao === 'sem_registro') {
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'botao-falta'; btn.textContent = 'Registrar falta';
        btn.addEventListener('click', async () => {
          if (!confirm(`Confirmar falta de ${a.nome} na data de hoje?`)) return;
          const justificativa = prompt('Justificativa (opcional, até 500 caracteres):', '');
          if (justificativa === null) return;
          btn.disabled = true;
          try {
            const r = await api(`/api/turmas/alunos/${a.id}/falta`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({justificativa})});
            $('mensagemTurmas').textContent = r.mensagem; await mostrarAlunos();
          } catch(e) { $('mensagemTurmas').textContent = e.message; btn.disabled = false; }
        }); acoes.append(btn);
      }
      if (a.situacao === 'falta') {
        const desfazer = document.createElement('button'); desfazer.type = 'button'; desfazer.className = 'botao-desfazer'; desfazer.textContent = 'Desfazer falta';
        desfazer.addEventListener('click', async () => {
          if (!confirm(`Desfazer a falta de hoje de ${a.nome}?`)) return;
          desfazer.disabled = true;
          try { await api(`/api/turmas/alunos/${a.id}/falta`,{method:'DELETE'}); await mostrarAlunos(); $('mensagemTurmas').textContent = 'Falta desfeita.'; }
          catch(e) { $('mensagemTurmas').textContent = e.message; desfazer.disabled = false; }
        }); acoes.append(desfazer);
      }
      lista.append(linha);
    }
  } catch(e) { $('mensagemTurmas').textContent = e.message; }
}
async function mostrarHistorico(aluno) {
  const painel = $('historicoAluno'), lista = $('listaHistorico'); painel.hidden = false;
  $('tituloHistorico').textContent = `Histórico de ${aluno.nome} — RA ${aluno.ra}`;
  $('resumoHistorico').textContent = 'Carregando...'; lista.replaceChildren();
  try {
    const d = await api(`/api/turmas/alunos/${aluno.id}/historico`);
    $('resumoHistorico').textContent = `Presenças: ${d.presentes} | Atrasos: ${d.atrasados} | Faltas confirmadas: ${d.faltas}` + (d.limitado ? ' (últimos 500 registros)' : '');
    if (!d.registros.length) { lista.textContent = 'Nenhum registro de frequência encontrado.'; return; }
    for (const r of d.registros) {
      const item = document.createElement('p'); item.className = 'historico-registro';
      const [y,m,day] = String(r.data).slice(0,10).split('-');
      item.textContent = `${day}/${m}/${y} — ${r.horario} — ${r.status === 'falta' ? 'Falta confirmada' : r.status}${r.justificativa ? ' — Justificativa: ' + r.justificativa : ''}`;
      lista.append(item);
    }
  } catch(e) { $('resumoHistorico').textContent = e.message; }
}
$('selectTurma').addEventListener('change', mostrarAlunos);
carregar();
